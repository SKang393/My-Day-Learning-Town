import { BaseTemplate, type TemplateContext } from "./BaseTemplate";
import type { ChoiceRound } from "../contentTypes";
import { makeChoiceVisual, recordChoiceDistribution, shuffled } from "./templateUtils";

export class ChooseOneOfThreeTemplate extends BaseTemplate {
  private roundIndex = 0;
  private locked = false;
  private modelSeen = false;
  private roundOrder: number[] = [];
  private speechSequenceId = 0;

  constructor(context: TemplateContext) {
    super(context);
  }

  mount(): void {
    this.roundIndex = 0;
    this.roundOrder = shuffled(this.context.content.rounds.map((_, index) => index));
    this.modelSeen = false;
    if (this.context.content.model) {
      this.renderModel();
      return;
    }
    this.renderRound();
  }

  private renderModel(): void {
    const model = this.context.content.model;
    if (!model) return;

    this.context.root.replaceChildren();

    const stage = document.createElement("section");
    stage.className = "game-card model-card";

    const title = document.createElement("h2");
    title.className = "model-title";
    title.textContent = model.title;

    const row = document.createElement("div");
    row.className = model.sceneImage ? "model-row model-scene-row" : model.examples?.length ? "model-row model-example-row" : "model-row";
    if (model.sceneImage) {
      row.append(this.modelScene(model.sceneImage));
    } else if (model.examples?.length) {
      model.examples.slice(0, 6).forEach((example) => row.append(this.modelPicture(example.image, example.label ?? "")));
    } else {
      row.append(this.modelPicture(model.targetImage, model.targetWord), this.modelConnector(model.arrowLabel), this.modelPicture(model.matchingImage, model.matchingLabel));
    }

    const explanation = document.createElement("p");
    explanation.className = "model-explanation";
    explanation.textContent = model.explanation;

    const start = this.button("Start Game", "primary-action");
    this.prepareModelStart(start, model, () => {
      this.modelSeen = true;
      this.renderRound();
    });

    stage.append(title, row, explanation, start);
    this.context.root.append(stage);
  }

  private modelPicture(image: string | undefined, label: string): HTMLElement {
    const card = document.createElement("div");
    card.className = "model-picture";
    if (image) {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "";
      card.append(img);
    }
    if (label && !image) {
      const text = document.createElement("strong");
      text.textContent = label;
      card.append(text);
    }
    return card;
  }

  private modelScene(image: string): HTMLElement {
    const card = document.createElement("div");
    card.className = "model-picture model-scene-picture";
    const img = document.createElement("img");
    img.src = image;
    img.alt = "";
    card.append(img);
    return card;
  }

  private renderRound(): void {
    this.locked = false;
    const round = this.currentRound();
    const progressLabel = `Progress: ${this.roundIndex + 1}/${this.context.content.rounds.length}.`;
    this.context.root.replaceChildren();
    this.speechSequenceId += 1;
    if (round.mode === "punctuation-pop" && round.sentence) {
      void this.playDirectionsThenLine(`Listen to the sentence. Choose the ending mark. ${progressLabel}`, round.sentence ?? round.instruction);
    } else if (round.mode === "long-vowel" && round.targetWord) {
      void this.playDirectionsThenLine(`Listen to the word. Choose its picture. ${progressLabel}`, round.targetWord ?? round.instruction);
    } else if (round.mode === "snack-tray" && round.sentence) {
      void this.playDirectionsThenLine(`Look at the picture and sentence. Choose the word that makes sense. ${progressLabel}`, round.sentence ?? round.instruction);
    } else {
      void this.context.onDirections(`${round.instruction} ${progressLabel}`);
    }

    const stage = document.createElement("section");
    stage.className = `game-card ${round.mode ? `${round.mode}-card` : ""}`;
    stage.dataset.testid = "game-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const promptArea = document.createElement("div");
    promptArea.className = "prompt-area";
    if (round.targetImage) {
      const target = document.createElement("img");
      target.className = `target-picture ${round.mode ? `${round.mode}-target-picture` : ""}`;
      target.src = round.targetImage;
      target.alt = "";
      promptArea.append(target);
    }
    if (round.mode === "save-goal") {
      promptArea.append(this.makeMoneyComparison(round.context));
    }

    const prompt = document.createElement("h2");
    prompt.className = "game-prompt";
    prompt.textContent = round.prompt;
    promptArea.append(prompt);

    const choices = document.createElement("div");
    choices.className = "choice-grid";
    choices.dataset.optionCount = String(Math.min(3, round.options?.length ?? 0));
    if (round.mode === "snack-tray") choices.classList.add("snack-tray-grid");
    if (round.mode === "parking-lot") choices.classList.add("parking-space-grid");
    if (round.mode === "punctuation-pop") choices.classList.add("punctuation-pop-grid");
    if (round.mode === "shape-hunt") choices.classList.add("shape-hunt-grid");
    if (round.mode === "equal-shares") choices.classList.add("equal-shares-grid");
    if (round.mode === "measure") choices.classList.add("measure-grid");
    if (round.mode === "garden-helper" || round.mode === "water-earth") choices.classList.add("garden-helper-grid");
    if (round.mode === "community-helper" || round.mode === "school-map" || round.mode === "help-community" || round.mode === "earn-money" || round.mode === "save-goal") choices.classList.add("social-choice-grid");
    if (round.mode === "long-vowel" || round.mode === "context-clue") choices.classList.add("word-choice-grid");
    const options = shuffled((round.options ?? []).slice(0, 3));
    recordChoiceDistribution(this.context.content.id, round.id, options, round.correctChoiceId);
    options.forEach((option, index) => {
      const hideChoiceText = this.shouldHideChoiceText(round);
      const button = this.button(round.mode === "long-vowel" || hideChoiceText ? "" : option.label);
      button.dataset.optionIndex = String(index);
      if (hideChoiceText) {
        button.classList.add("picture-only-choice");
        button.setAttribute("aria-label", option.label);
      }
      if (round.mode === "snack-tray") {
        button.classList.add("snack-tray-button");
        button.setAttribute("aria-label", option.label);
        button.dataset.testid = `snack-word-${option.id}`;
      }
      if (round.mode === "parking-lot") {
        button.classList.add("parking-space-button");
        button.setAttribute("aria-label", `Parking space ${option.label}`);
        button.dataset.testid = `parking-space-${option.id}`;
        button.prepend(this.makeNumberDots(Number(option.label)));
      }
      if (round.mode === "punctuation-pop") {
        button.classList.add("punctuation-pop-button");
        button.dataset.testid = `punctuation-choice-${option.id}`;
      }
      if (round.mode === "shape-hunt") {
        button.classList.add("shape-hunt-button");
        button.dataset.testid = `shape-choice-${option.id}`;
      }
      if (round.mode === "equal-shares") {
        button.classList.add("equal-shares-button");
        button.dataset.testid = `share-choice-${option.id}`;
      }
      if (round.mode === "measure") {
        button.classList.add("measure-button");
        button.dataset.testid = `measure-choice-${option.id}`;
      }
      if (round.mode === "garden-helper" || round.mode === "water-earth") {
        button.classList.add("garden-helper-button");
        button.dataset.testid = `garden-choice-${option.id}`;
      }
      if (round.mode === "community-helper" || round.mode === "school-map" || round.mode === "help-community" || round.mode === "earn-money" || round.mode === "save-goal") {
        button.classList.add("social-choice-button");
        button.dataset.testid = `social-choice-${option.id}`;
      }
      if (round.mode === "long-vowel" || round.mode === "context-clue") {
        button.classList.add("word-choice-button");
        button.dataset.testid = `word-choice-${option.id}`;
      }
      button.dataset.choiceId = option.id;
      if (option.image) {
        const image = document.createElement("img");
        image.src = option.image;
        image.alt = "";
        button.prepend(image);
      } else if (!["snack-tray", "parking-lot", "punctuation-pop", "measure"].includes(round.mode ?? "")) {
        button.prepend(makeChoiceVisual(option.label));
      }
      if (round.mode === "long-vowel") {
        button.append(this.makeLongVowelWord(option.label || option.id));
      }
      button.addEventListener("click", () => this.handleChoice(round, option.id, button));
      choices.append(button);
    });

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, promptArea, choices, progress);
    this.context.root.append(stage);
  }

  private currentRound(): ChoiceRound {
    return this.context.content.rounds[this.roundOrder[this.roundIndex] ?? this.roundIndex];
  }

  private shouldHideChoiceText(round: ChoiceRound): boolean {
    return Boolean(
      round.mode &&
        [
          "garden-helper",
          "water-earth",
          "community-helper",
          "school-map",
          "help-community",
          "earn-money",
          "save-goal",
          "punctuation-pop",
          "shape-hunt",
          "equal-shares",
          "context-clue",
        ].includes(round.mode),
    );
  }

  private async playDirectionsThenLine(directions: string, followUp: string): Promise<void> {
    const sequenceId = ++this.speechSequenceId;
    await Promise.resolve(this.context.onDirections(directions));
    if (sequenceId !== this.speechSequenceId) return;
    if (this.context.onSpeakAsync) {
      await this.context.onSpeakAsync(followUp);
      return;
    }
    this.context.onSpeak(followUp);
  }

  private makeNumberDots(value: number): HTMLElement {
    return this.makeDotCue(value, "number-dot-cue");
  }

  private makeDotCue(value: number, className: string): HTMLElement {
    const dotWrap = document.createElement("span");
    dotWrap.className = className;
    dotWrap.dataset.count = String(value);
    const count = Number.isFinite(value) ? Math.min(30, Math.max(1, value)) : 1;
    for (let index = 0; index < count; index += 1) {
      const dot = document.createElement("i");
      dotWrap.append(dot);
    }
    return dotWrap;
  }

  private makeLongVowelWord(label: string): HTMLElement {
    const word = document.createElement("span");
    word.className = "long-vowel-word";
    const displayWord = label.trim().split(/\s+/)[0] ?? label;
    if (/^alligator$/i.test(displayWord)) {
      word.textContent = displayWord;
      return word;
    }
    const splitMatch = displayWord.match(/^(.*?)(a)(.+)(e)$/i);
    if (splitMatch && displayWord.length >= 4) {
      word.append(document.createTextNode(splitMatch[1]));
      const first = document.createElement("b");
      first.textContent = splitMatch[2];
      const middle = document.createElement("span");
      middle.textContent = splitMatch[3];
      const last = document.createElement("b");
      last.textContent = splitMatch[4];
      word.append(first, middle, last);
      word.dataset.connector = "true";
      return word;
    }
    const longPatterns = /(ai|ay|a)/i;
    const match = displayWord.match(longPatterns);
    if (!match || match.index === undefined) {
      word.textContent = displayWord;
      return word;
    }
    word.append(document.createTextNode(displayWord.slice(0, match.index)));
    const mark = document.createElement("b");
    mark.textContent = match[0];
    word.append(mark, document.createTextNode(displayWord.slice(match.index + match[0].length)));
    return word;
  }

  private makeMoneyComparison(context: string): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "money-comparison-panel";
    const matches = Array.from(context.matchAll(/(\d+)\s+dollars?/gi)).map((match) => match[1]);
    const cost = matches[0] ?? "?";
    const have = matches[1] ?? "?";
    const costBadge = document.createElement("span");
    costBadge.className = "money-badge";
    costBadge.textContent = `Cost $${cost}`;
    const haveBadge = document.createElement("span");
    haveBadge.className = "money-badge";
    haveBadge.textContent = `Have $${have}`;
    panel.append(costBadge, haveBadge);
    return panel;
  }

  private handleChoice(round: ChoiceRound, choiceId: string, button: HTMLButtonElement): void {
    if (this.locked) return;

    if (round.correctChoiceId && choiceId === round.correctChoiceId) {
      this.locked = true;
      button.classList.add("is-correct");
      this.context.onRoundComplete(this.roundIndex);
      void this.context.onPraise(round.praise).then(() => this.advance());
      return;
    }

    button.classList.add("is-neutral-wrong");
    this.context.onNeutral();
    window.setTimeout(() => button.classList.remove("is-neutral-wrong"), 650);
  }

  private advance(): void {
    if (this.roundIndex < this.context.content.rounds.length - 1) {
      this.roundIndex += 1;
      this.renderRound();
      return;
    }

    this.renderComplete();
  }

  private renderComplete(): void {
    this.context.root.replaceChildren();
    const panel = document.createElement("section");
    panel.className = "game-card complete-card";
    const title = document.createElement("h2");
    title.textContent = "Game complete";
    const text = document.createElement("p");
    text.textContent = "You finished all the rounds.";
    const replay = this.button("Play Again", "primary-action");
    replay.addEventListener("click", () => this.mount());
    panel.append(title, text);
    this.appendCompletionNavigation(panel, replay);
    this.context.root.append(panel);
  }
}
