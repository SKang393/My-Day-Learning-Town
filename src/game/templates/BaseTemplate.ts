import type { GameContent, ModelStep } from "../contentTypes";

export interface TemplateContext {
  root: HTMLElement;
  content: GameContent;
  onDirections: (text: string) => void | Promise<void>;
  onModelDirections?: (instruction: string, explanation?: string) => Promise<void>;
  onSpeak: (text: string) => void;
  onSpeakAsync?: (text: string) => Promise<void>;
  onPraise: (text: string) => Promise<void>;
  onNeutral: () => void;
  onRoundComplete: (roundIndex: number) => void;
  onExit: () => void;
  onBackToArea?: () => void;
}

export interface MiniGameTemplate {
  mount(): void;
  unmount(): void;
}

export abstract class BaseTemplate implements MiniGameTemplate {
  protected context: TemplateContext;

  constructor(context: TemplateContext) {
    this.context = context;
  }

  abstract mount(): void;

  unmount(): void {
    this.context.root.replaceChildren();
  }

  protected button(label: string, className = "choice-button"): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    return button;
  }

  protected appendCompletionNavigation(panel: HTMLElement, replay: HTMLButtonElement): void {
    const backToArea = this.button("Back to Area", "secondary-action");
    backToArea.addEventListener("click", () => {
      if (this.context.onBackToArea) {
        this.context.onBackToArea();
        return;
      }
      this.context.onExit();
    });
    const home = this.button("Back to Home", "secondary-action");
    home.addEventListener("click", this.context.onExit);
    panel.append(replay, backToArea, home);
  }

  protected modelConnector(label?: string): HTMLElement {
    const connector = document.createElement("div");
    connector.className = "model-arrow";
    const accessibleLabel = label?.trim();
    if (accessibleLabel) {
      connector.setAttribute("aria-label", accessibleLabel);
      connector.setAttribute("role", "img");
    } else {
      connector.setAttribute("aria-hidden", "true");
    }
    return connector;
  }

  protected prepareModelStart(start: HTMLButtonElement, model: ModelStep, onStart: () => void): void {
    start.disabled = true;
    start.classList.add("is-waiting-for-audio");
    start.textContent = "Listen First";

    let unlocked = false;
    const safeTimeoutMs = Math.min(22000, Math.max(9000, `${model.instruction} ${model.explanation}`.length * 150));
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      start.disabled = false;
      start.classList.remove("is-waiting-for-audio");
      start.textContent = "Start Game";
    };

    const timer = window.setTimeout(() => {
      console.warn(`Model audio did not finish before timeout for ${this.context.content.id}.`);
      unlock();
    }, safeTimeoutMs);

    const modelAudio = this.context.onModelDirections
      ? this.context.onModelDirections(model.instruction, model.explanation)
      : Promise.resolve(this.context.onDirections(model.instruction));

    void modelAudio
      .catch((error) => console.warn(`Model audio failed for ${this.context.content.id}.`, error))
      .finally(() => {
        window.clearTimeout(timer);
        unlock();
      });

    start.addEventListener("click", () => {
      if (start.disabled) return;
      onStart();
    });
  }
}
