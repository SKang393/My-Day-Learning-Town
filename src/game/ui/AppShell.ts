import { categories, gameRegistry } from "../registry";
import type { CategoryId, GameDefinition } from "../contentTypes";
import { getProgress, getSettings, resetProgress, resetSettings, saveRoundProgress, saveSettings } from "../systems/storage";
import { getAudioDebugState, praiseWithChime, speak, speakAsync, syncAudioDebugSettings } from "../systems/speech";
import { audioConfig, type PraiseWaitMode } from "../systems/audioConfig";
import { createTemplate } from "../templates/templateFactory";
import type { MiniGameTemplate } from "../templates/BaseTemplate";
import { fitTextTree, observeFittedText } from "./fitText";

export class AppShell {
  private root: HTMLElement;
  private activeTemplate?: MiniGameTemplate;
  private directions = "Choose a town area.";
  private activeCategory?: CategoryId;
  private feedbackTimeout?: number;
  private fitTextObserver?: ResizeObserver;
  private fitTextFrame?: number;
  private refitHandler?: () => void;
  private videoConfirmTimer?: number;
  private categoryPageIndex: Partial<Record<CategoryId, number>> = {};
  private readonly gamesPerPage = 6;
  private modelAudioLocked = false;

  constructor(root: HTMLElement) {
    this.root = root;
    window.addEventListener("learning-town-audio-state", () => this.updateVoiceSelect());
  }

  showSplash(): void {
    this.activeTemplate?.unmount();
    this.activeCategory = undefined;
    this.root.replaceChildren();
    this.root.className = "app-shell mode-splash";

    const splash = document.createElement("section");
    splash.className = "splash-screen";
    const logo = document.createElement("div");
    logo.className = "splash-logo";
    logo.textContent = "My Day Learning Town";
    const terms = document.createElement("section");
    terms.className = "terms-card";
    const termsTitle = document.createElement("h2");
    termsTitle.textContent = "Terms of Service";
    const termsText = document.createElement("p");
    termsText.textContent = "This game is for classroom learning. Use kind words, take turns, and ask an adult for help when needed.";
    const termsActions = document.createElement("div");
    termsActions.className = "terms-actions";
    const agree = this.controlButton("Agree", () => this.showHome(), "terms-agree");
    const disagree = this.controlButton("Disagree", () => this.showTermsBlocked(), "terms-disagree");
    const message = document.createElement("p");
    message.className = "terms-message";
    message.dataset.testid = "terms-message";
    message.textContent = "";
    termsActions.append(agree, disagree);
    terms.append(termsTitle, termsText, termsActions, message);
    splash.append(logo, terms);
    this.root.append(splash);

    speak("Welcome to My Day Learning Town.");
  }

  private showTermsBlocked(): void {
    const message = this.root.querySelector<HTMLElement>("[data-testid='terms-message']");
    const text = "You need to agree to the Terms of Service to play this game. If you do not agree, please exit the game.";
    if (message) message.textContent = text;
    speak(text);
    this.refitHandler?.();
  }

  showHome(): void {
    this.activeTemplate?.unmount();
    this.activeCategory = undefined;
    this.directions = "Choose a learning area";
    this.renderFrame("home", this.homeContent());
    speak(this.directions);
  }

  private showCategory(categoryId: CategoryId): void {
    const category = categories.find((item) => item.id === categoryId);
    if (!category || category.locked) return;
    this.activeTemplate?.unmount();
    this.activeCategory = categoryId;
    this.directions = `Choose a ${category.title} game.`;
    this.renderFrame("category", this.categoryContent(categoryId));
    speak(this.directions);
  }

  private showGame(game: GameDefinition): void {
    if (!game.content) return;
    this.activeCategory = game.category;
    this.modelAudioLocked = false;
    this.directions = game.content.directions;
    const gameMount = document.createElement("div");
    gameMount.className = "game-mount";
    gameMount.dataset.testid = game.id;
    this.renderFrame("game", gameMount, game.title, game.category);

    this.activeTemplate = createTemplate(game.content, {
      root: gameMount,
      onDirections: (text) => {
        this.directions = text;
        this.updateInstruction(text);
        return speakAsync(text);
      },
      onModelDirections: async (instruction, explanation) => {
        this.directions = instruction;
        this.updateInstruction(instruction);
        this.modelAudioLocked = true;
        try {
          await speakAsync(instruction);
          if (explanation?.trim()) await speakAsync(explanation);
        } finally {
          this.modelAudioLocked = false;
        }
      },
      onSpeak: (text) => speak(text),
      onSpeakAsync: (text) => speakAsync(text),
      onPraise: async (text) => {
        this.showFeedback(text, "correct");
        await praiseWithChime(text);
      },
      onNeutral: () => this.showFeedback("Try again.", "neutral"),
      onRoundComplete: (roundIndex) => saveRoundProgress(game.content!, roundIndex),
      onExit: () => this.showHome(),
      onBackToArea: () => this.showCategory(game.category),
    });
    this.activeTemplate.mount();
  }

  private renderFrame(mode: string, content: HTMLElement, title = "My Day Learning Town", backCategory?: CategoryId): void {
    window.scrollTo({ top: 0, left: 0 });
    this.root.replaceChildren();
    this.root.className = `app-shell mode-${mode}`;

    const topBar = document.createElement("header");
    topBar.className = "top-bar";

    const titleBlock = document.createElement("div");
    titleBlock.className = "title-block";
    const eyebrow = document.createElement("span");
    eyebrow.textContent = "My Day Learning Town";
    const heading = document.createElement("h1");
    heading.textContent = title;
    heading.dataset.fitText = "true";
    heading.dataset.fitMin = "20";
    titleBlock.append(eyebrow, heading);

    const controls = document.createElement("nav");
    controls.className = "shell-controls";
    controls.append(this.controlButton("Home", () => this.showHome(), "home-button"));
    if (mode === "game" && backCategory) {
      const backButton = this.controlButton("Back to Area", () => this.showCategory(backCategory), "back-area-button");
      const category = categories.find((item) => item.id === backCategory);
      backButton.title = `Back to ${category?.title ?? "current area"}`;
      controls.append(backButton);
    }
    controls.append(
      this.controlButton(getSettings().audioEnabled ? "Audio On" : "Audio Off", () => this.toggleAudio(), "audio-toggle"),
      this.controlButton("Settings", () => this.showSettingsPanel(), "settings-button"),
    );

    topBar.append(titleBlock, controls);

    const instruction = document.createElement("section");
    instruction.className = "instruction-panel";
    instruction.dataset.testid = "instruction-panel";
    instruction.dataset.fitText = "true";
    instruction.dataset.fitMin = "18";
    instruction.setAttribute("role", "button");
    instruction.tabIndex = 0;
    instruction.title = "Replay this sentence";
    instruction.textContent = this.directions;
    instruction.addEventListener("click", () => this.replayDirections());
    instruction.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.replayDirections();
      }
    });

    if (mode === "game") {
      const revealZone = document.createElement("div");
      revealZone.className = "top-reveal-zone";
      revealZone.setAttribute("aria-hidden", "true");
      this.root.append(revealZone);
    }

    this.root.append(topBar, instruction, content);
    if (mode === "game") {
      const feedback = document.createElement("section");
      feedback.className = "feedback-panel";
      feedback.dataset.testid = "feedback-panel";
      feedback.textContent = "";
      this.root.append(feedback);
    }
    this.installTextFitting();
  }

  private homeContent(): HTMLElement {
    const grid = document.createElement("section");
    grid.className = "tile-grid hub-grid";
    categories.forEach((category) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `hub-tile ${category.locked ? "is-locked" : ""}`;
      tile.disabled = category.locked;
      tile.dataset.category = category.id;
      tile.innerHTML = `<img src="${category.image}" alt="" /><strong data-fit-text="true" data-fit-lines="2" data-fit-min="18">${category.title}</strong>`;
      tile.addEventListener("click", () => this.showCategory(category.id));
      grid.append(tile);
    });
    return grid;
  }

  private categoryContent(categoryId: CategoryId): HTMLElement {
    const games = gameRegistry.filter((game) => game.category === categoryId);
    const pageCount = Math.max(1, Math.ceil(games.length / this.gamesPerPage));
    const pageIndex = Math.min(this.categoryPageIndex[categoryId] ?? 0, pageCount - 1);
    this.categoryPageIndex[categoryId] = pageIndex;

    const section = document.createElement("section");
    section.className = "game-pager";
    section.dataset.pageCount = String(pageCount);
    section.dataset.currentPage = String(pageIndex + 1);

    const grid = document.createElement("div");
    grid.className = "tile-grid game-grid";
    grid.dataset.testid = "game-grid";
    grid.dataset.page = String(pageIndex + 1);
    games
      .slice(pageIndex * this.gamesPerPage, pageIndex * this.gamesPerPage + this.gamesPerPage)
      .forEach((game) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = `game-tile ${game.status} ${game.image ? "has-image" : ""}`;
        tile.setAttribute("aria-label", game.title);
        tile.title = game.title;
        tile.disabled = game.status !== "playable";
        tile.innerHTML = `${game.image ? `<img class="game-preview" src="${game.image}" alt="" />` : ""}`;
        tile.addEventListener("click", () => this.showGame(game));
        grid.append(tile);
      });
    section.append(grid);

    if (pageCount > 1) {
      const dots = document.createElement("div");
      dots.className = "page-indicator";
      dots.setAttribute("aria-label", "Game pages");
      for (let index = 0; index < pageCount; index += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `page-dot ${index === pageIndex ? "is-current" : ""}`;
        dot.setAttribute("aria-label", `Game page ${index + 1} of ${pageCount}`);
        dot.dataset.testid = `game-page-${index + 1}`;
        dot.addEventListener("click", () => this.changeCategoryPage(categoryId, index));
        dots.append(dot);
      }
      section.append(dots);
    }

    this.installSwipePaging(section, categoryId, pageIndex, pageCount);
    return section;
  }

  private changeCategoryPage(categoryId: CategoryId, pageIndex: number): void {
    this.categoryPageIndex[categoryId] = pageIndex;
    this.renderFrame("category", this.categoryContent(categoryId));
  }

  private installSwipePaging(section: HTMLElement, categoryId: CategoryId, pageIndex: number, pageCount: number): void {
    if (pageCount <= 1) return;
    let startX = 0;
    let startY = 0;
    section.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
      startY = event.clientY;
    });
    section.addEventListener("pointerup", (event) => {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
      const nextPage = deltaX < 0 ? Math.min(pageCount - 1, pageIndex + 1) : Math.max(0, pageIndex - 1);
      if (nextPage !== pageIndex) this.changeCategoryPage(categoryId, nextPage);
    });
  }

  private replayDirections(): void {
    if (this.modelAudioLocked) return;
    speak(this.directions);
  }

  private controlButton(label: string, action: () => void, testId: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "control-button";
    button.dataset.testid = testId;
    button.dataset.fitText = "true";
    button.dataset.fitMin = "15";
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  }

  private toggleAudio(): void {
    const settings = getSettings();
    saveSettings({ audioEnabled: !settings.audioEnabled });
    const audioButton = this.root.querySelector<HTMLButtonElement>("[data-testid='audio-toggle']");
    if (audioButton) audioButton.textContent = getSettings().audioEnabled ? "Audio On" : "Audio Off";
    this.refitHandler?.();
    if (getSettings().audioEnabled) speak("Audio is on.", true);
  }

  private updateInstruction(text: string): void {
    const panel = this.root.querySelector<HTMLElement>("[data-testid='instruction-panel']");
    if (panel) panel.textContent = text;
    this.refitHandler?.();
  }

  private showFeedback(text: string, kind: "correct" | "neutral"): void {
    const panel = this.root.querySelector<HTMLElement>("[data-testid='feedback-panel']");
    if (!panel) return;
    if (this.feedbackTimeout) window.clearTimeout(this.feedbackTimeout);
    panel.textContent = text;
    panel.className = `feedback-panel ${kind}`;
    this.feedbackTimeout = window.setTimeout(() => {
      panel.textContent = "";
      panel.className = "feedback-panel";
      this.feedbackTimeout = undefined;
    }, kind === "correct" ? 1000 : 700);
  }

  private showSettingsPanel(): void {
    const existing = this.root.querySelector(".settings-panel");
    if (existing) {
      existing.remove();
      return;
    }

    const panel = document.createElement("aside");
    panel.className = "settings-panel";
    const settings = getSettings();
    const progress = getProgress();

    const title = document.createElement("h2");
    title.textContent = "Settings";

    const audioSection = this.settingsSection("Audio Settings", [
      this.kokoroStatusRow(),
      this.settingSlider("Voice Speed", "speech-speed", settings.speechRate, audioConfig.minSpeechRate, audioConfig.maxSpeechRate, 0.05, (value) => {
        saveSettings({ speechRate: value });
        syncAudioDebugSettings();
      }),
      this.settingSlider("Speech Volume", "speech-volume", settings.voiceVolume, 0, 1, 0.05, (value) => {
        saveSettings({ voiceVolume: value });
        syncAudioDebugSettings();
      }),
      this.settingSlider("Chime Volume", "chime-volume", settings.chimeVolume, 0, 1, 0.05, (value) => {
        saveSettings({ chimeVolume: value });
        syncAudioDebugSettings();
      }),
    ]);

    const videoSection = this.settingsSection("Video Settings", [this.videoPresetRow()]);

    const praiseWait = this.settingSelect<PraiseWaitMode>(
      "Praise Wait",
      "praise-wait",
      settings.praiseWaitMode,
      [
        ["full", "Wait for full praise"],
        ["short", "Short wait"],
        ["skip", "Skip praise wait"],
      ],
      (value) => saveSettings({ praiseWaitMode: value }),
    );
    const saved = document.createElement("p");
    saved.className = "settings-summary";
    saved.textContent = `${Object.keys(progress.completedRounds).length} saved games`;
    const reset = this.controlButton("Reset Game Progress", () => {
      resetProgress();
      panel.remove();
      this.showHome();
    }, "reset-progress");
    const gameSection = this.settingsSection("Game Settings", [praiseWait, saved, reset]);

    const resetAll = this.controlButton("Reset All Settings to Default", () => {
      resetSettings();
      panel.remove();
      this.showSettingsPanel();
      const audioButton = this.root.querySelector<HTMLButtonElement>("[data-testid='audio-toggle']");
      if (audioButton) audioButton.textContent = getSettings().audioEnabled ? "Audio On" : "Audio Off";
      syncAudioDebugSettings();
      this.refitHandler?.();
    }, "reset-all-settings");
    const close = this.controlButton("Close", () => panel.remove(), "close-settings");
    panel.append(title, audioSection, videoSection, gameSection, resetAll, close);
    this.root.append(panel);
    this.installTextFitting();
  }

  private settingsSection(title: string, rows: HTMLElement[]): HTMLElement {
    const section = document.createElement("section");
    section.className = "settings-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.append(heading, ...rows);
    return section;
  }

  private kokoroStatusRow(): HTMLElement {
    const state = getAudioDebugState();
    const row = document.createElement("div");
    row.className = "setting-row kokoro-status-row";
    row.dataset.voiceRow = "true";
    const label = document.createElement("span");
    label.textContent = `Speech: ${audioConfig.kokoroVoiceDisplayName}`;
    const status = document.createElement("small");
    status.textContent =
      state.actualBackend === "kokoro-local"
        ? "Primary local WAV speech"
        : "Kokoro WAV files need generation before classroom use";
    row.append(label, status);
    return row;
  }

  private updateVoiceSelect(): void {
    const existing = this.root.querySelector<HTMLElement>("[data-voice-row='true']");
    if (!existing) return;
    existing.replaceWith(this.kokoroStatusRow());
    this.refitHandler?.();
  }

  private videoPresetRow(): HTMLElement {
    const row = document.createElement("div");
    row.className = "video-preset-row";
    [
      [1280, 720],
      [1920, 1080],
      [2560, 1440],
      [3840, 2160],
    ].forEach(([width, height]) => {
      row.append(this.controlButton(`${width}x${height}`, () => void this.applyVideoPreset(width, height), `video-${width}x${height}`));
    });
    return row;
  }

  private async applyVideoPreset(width: number, height: number): Promise<void> {
    const desktop = window.learningTownDesktop;
    const previousBounds = desktop ? await desktop.getWindowBounds() : { x: window.screenX, y: window.screenY, width: window.outerWidth, height: window.outerHeight };
    const displayInfo = desktop
      ? await desktop.getDisplayInfo()
      : { workArea: { width: window.screen.availWidth, height: window.screen.availHeight } };
    const mayNotFit = width > displayInfo.workArea.width || height > displayInfo.workArea.height;
    if (mayNotFit) {
      const ok = window.confirm(`${width}x${height} may be larger than this screen. Try it anyway?`);
      if (!ok) return;
    }
    try {
      if (desktop) {
        await desktop.setWindowSize(width, height);
      } else {
        window.resizeTo(width, height);
      }
    } catch {
      window.resizeTo(width, height);
    }
    this.showVideoConfirmation(previousBounds);
    this.refitHandler?.();
  }

  private showVideoConfirmation(previousBounds: { x: number; y: number; width: number; height: number }): void {
    this.root.querySelector(".settings-confirm")?.remove();
    if (this.videoConfirmTimer) window.clearTimeout(this.videoConfirmTimer);

    const popup = document.createElement("section");
    popup.className = "settings-confirm";
    popup.setAttribute("role", "dialog");
    const message = document.createElement("p");
    message.textContent = "Keep this size?";
    const keep = this.controlButton("Keep this size", () => {
      if (this.videoConfirmTimer) window.clearTimeout(this.videoConfirmTimer);
      popup.remove();
    }, "keep-video-size");
    const revert = this.controlButton("Revert", () => {
      if (this.videoConfirmTimer) window.clearTimeout(this.videoConfirmTimer);
      void this.revertVideoPreset(previousBounds);
      popup.remove();
    }, "revert-video-size");
    popup.append(message, keep, revert);
    this.root.append(popup);
    this.videoConfirmTimer = window.setTimeout(() => {
      void this.revertVideoPreset(previousBounds);
      popup.remove();
    }, 9000);
  }

  private async revertVideoPreset(bounds: { x: number; y: number; width: number; height: number }): Promise<void> {
    const desktop = window.learningTownDesktop;
    try {
      if (desktop) {
        await desktop.setWindowBounds(bounds);
      } else {
        window.resizeTo(bounds.width, bounds.height);
      }
    } catch {
      window.resizeTo(bounds.width, bounds.height);
    }
    this.refitHandler?.();
  }

  private settingSelect<T extends string>(
    label: string,
    testId: string,
    value: T,
    options: Array<[T, string]>,
    onChange: (value: T) => void,
  ): HTMLElement {
    const wrapper = document.createElement("label");
    wrapper.className = "setting-row";
    wrapper.textContent = label;
    const select = document.createElement("select");
    select.dataset.testid = testId;
    options.forEach(([optionValue, optionLabel]) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionLabel;
      option.selected = optionValue === value;
      select.append(option);
    });
    select.addEventListener("change", () => {
      onChange(select.value as T);
      syncAudioDebugSettings();
    });
    wrapper.append(select);
    return wrapper;
  }

  private settingSlider(
    label: string,
    testId: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
  ): HTMLElement {
    const wrapper = document.createElement("label");
    wrapper.className = "setting-row setting-slider";
    const text = document.createElement("span");
    text.textContent = `${label}: ${value.toFixed(2)}`;
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.dataset.testid = testId;
    input.addEventListener("input", () => {
      const nextValue = Number(input.value);
      text.textContent = `${label}: ${nextValue.toFixed(2)}`;
      onChange(nextValue);
      syncAudioDebugSettings();
    });
    wrapper.append(text, input);
    return wrapper;
  }

  private installTextFitting(): void {
    this.fitTextObserver?.disconnect();
    if (this.fitTextFrame) window.cancelAnimationFrame(this.fitTextFrame);
    if (this.refitHandler) {
      window.removeEventListener("resize", this.refitHandler);
      window.removeEventListener("orientationchange", this.refitHandler);
    }

    const refit = () => {
      if (this.fitTextFrame) window.cancelAnimationFrame(this.fitTextFrame);
      this.fitTextFrame = window.requestAnimationFrame(() => {
        fitTextTree(this.root);
        this.fitTextFrame = undefined;
      });
    };

    refit();
    this.fitTextObserver = observeFittedText(this.root, refit);
    this.refitHandler = refit;
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
  }
}
