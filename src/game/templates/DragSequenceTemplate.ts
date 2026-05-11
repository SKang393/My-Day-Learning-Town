import { BaseTemplate, type TemplateContext } from "./BaseTemplate";
import type { ChoiceRound } from "../contentTypes";
import { makeChoiceVisual, recordChoiceDistribution, shuffled, shuffledAwayFromOrder } from "./templateUtils";

export class DragSequenceTemplate extends BaseTemplate {
  private roundIndex = 0;
  private locked = false;
  private placedParts = new Map<number, string>();
  private selectedPunctuation = "";
  private roundOrder: number[] = [];
  private dragState?: {
    pointerId: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    card: HTMLElement;
  };

  constructor(context: TemplateContext) {
    super(context);
  }

  mount(): void {
    this.roundIndex = 0;
    this.roundOrder = shuffled(this.context.content.rounds.map((_, index) => index));
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
    this.prepareModelStart(start, model, () => this.renderRound());

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
    this.placedParts.clear();
    this.selectedPunctuation = "";
    const round = this.currentRound();
    this.context.root.replaceChildren();
    this.context.onDirections(`${round.instruction} Progress: ${this.roundIndex + 1}/${this.context.content.rounds.length}.`);

    if (!round.sentence || !round.sentenceImage || !round.sentenceParts || !round.correctSequence) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Fix the Sentence</h2><p>This round needs a sentence, picture, sentence parts, and a correct sequence.</p></section>`;
      return;
    }

    const correctSequence = round.correctSequence;
    const sentenceParts = round.sentenceParts;

    const stage = document.createElement("section");
    stage.className = "game-card sentence-card";
    if (round.mode === "opinion-builder") stage.classList.add("opinion-card");
    stage.dataset.testid = "sentence-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const top = document.createElement("div");
    top.className = "sentence-top";
    const image = document.createElement("img");
    image.className = "sentence-picture";
    image.src = round.sentenceImage;
    image.alt = "";
    const prompt = document.createElement("h2");
    prompt.className = "sentence-prompt";
    prompt.textContent = round.mode === "opinion-builder" ? "" : round.prompt;
    top.append(image);
    if (prompt.textContent) top.append(prompt);

    const slots = document.createElement("div");
    slots.className = "sentence-slot-row";
    slots.style.gridTemplateColumns = `repeat(${correctSequence.length}, minmax(0, 1fr))`;
    const matchColors = ["#006d9c", "#1f8a4c", "#c93636", "#9a6b00", "#5c3fa3"];
    correctSequence.forEach((partId, index) => {
      const slot = document.createElement("div");
      slot.className = "sentence-slot";
      if (round.mode === "opinion-builder") slot.classList.add("opinion-slot");
      slot.dataset.slotIndex = String(index);
      slot.dataset.expectedPartId = partId;
      slot.dataset.testid = `sentence-slot-${index}`;
      slot.style.setProperty("--match-color", matchColors[index % matchColors.length]);
      const showSlotLabel = round.slotLabels?.[index] && !["opinion-builder", "story-order"].includes(round.mode ?? "");
      slot.innerHTML = showSlotLabel ? `<small>${round.slotLabels?.[index]}</small><span></span>` : "";
      slots.append(slot);
    });

    const tray = document.createElement("div");
    tray.className = "sentence-tray";
    tray.style.gridTemplateColumns = `repeat(${correctSequence.length}, minmax(0, 1fr))`;
    const orderedParts = round.mode === "story-order"
      ? shuffledAwayFromOrder(sentenceParts.slice(0, 5), correctSequence)
      : shuffled(sentenceParts.slice(0, 5));
    orderedParts.forEach((part) => {
      const card = document.createElement("div");
      card.className = "sentence-part-card";
      if (round.mode === "opinion-builder") card.classList.add("opinion-part-card");
      card.dataset.partId = part.id;
      card.dataset.testid = `sentence-part-${part.id}`;
      const expectedIndex = correctSequence.indexOf(part.id);
      if (expectedIndex >= 0) card.style.setProperty("--match-color", matchColors[expectedIndex % matchColors.length]);
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Drag ${part.label}`);
      if (part.image) {
        const image = document.createElement("img");
        image.src = part.image;
        image.alt = "";
        card.append(image);
      }
      const text = document.createElement("strong");
      text.textContent = part.label;
      card.append(text);
      card.addEventListener("pointerdown", (event) => this.startDrag(event, card));
      tray.append(card);
    });

    const punctuationPanel = this.renderPunctuationPanel(round);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, top, slots, tray);
    if (punctuationPanel) stage.append(punctuationPanel);
    stage.append(progress);
    this.context.root.append(stage);
  }

  private renderPunctuationPanel(round: ChoiceRound): HTMLElement | undefined {
    if (!round.punctuationChoices || !round.correctPunctuation) return undefined;
    const panel = document.createElement("div");
    panel.className = "punctuation-panel";
    const label = document.createElement("p");
    label.textContent = "Choose the ending mark.";
    const buttons = document.createElement("div");
    buttons.className = "punctuation-buttons";
    const punctuationOptions = shuffled(round.punctuationChoices.slice(0, 3).map((mark) => ({ id: mark, label: mark })));
    recordChoiceDistribution(this.context.content.id, round.id, punctuationOptions, round.correctPunctuation);
    punctuationOptions.forEach((option, index) => {
      const mark = option.id;
      const button = this.button("", "punctuation-button");
      button.setAttribute("aria-label", mark);
      button.dataset.punctuation = mark;
      button.dataset.optionIndex = String(index);
      button.dataset.testid = `punctuation-${this.punctuationName(mark)}`;
      button.prepend(makeChoiceVisual(mark, "punctuation-symbol-visual"));
      button.addEventListener("click", () => this.choosePunctuation(round, button, mark));
      buttons.append(button);
    });
    panel.append(label, buttons);
    return panel;
  }

  private punctuationName(mark: string): string {
    if (mark === ".") return "period";
    if (mark === "?") return "question";
    if (mark === "!") return "exclamation";
    return mark;
  }

  private choosePunctuation(round: ChoiceRound, button: HTMLButtonElement, mark: string): void {
    if (this.locked) return;
    if (mark !== round.correctPunctuation) {
      button.classList.add("is-neutral-wrong");
      this.context.onNeutral();
      window.setTimeout(() => button.classList.remove("is-neutral-wrong"), 700);
      return;
    }

    this.selectedPunctuation = mark;
    this.context.root.querySelectorAll(".punctuation-button").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    this.checkCompletion(round);
  }

  private startDrag(event: PointerEvent, card: HTMLElement): void {
    if (this.locked || card.dataset.placed === "true") return;
    event.preventDefault();
    card.setPointerCapture(event.pointerId);
    card.classList.add("is-dragging");
    this.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: 0,
      currentY: 0,
      card,
    };
    window.addEventListener("pointermove", this.moveDrag);
    window.addEventListener("pointerup", this.endDrag);
    window.addEventListener("pointercancel", this.cancelDrag);
  }

  private moveDrag = (event: PointerEvent): void => {
    const drag = this.dragState;
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.currentX = event.clientX - drag.startX;
    drag.currentY = event.clientY - drag.startY;
    drag.card.style.transform = `translate(${drag.currentX}px, ${drag.currentY}px)`;
  };

  private endDrag = (event: PointerEvent): void => {
    const drag = this.dragState;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const slot = this.findSlotAt(event.clientX, event.clientY, drag.card);
    this.detachDragListeners(drag.card);

    if (slot && this.canPlaceInSlot(slot, drag.card)) {
      this.placeCard(slot, drag.card);
      return;
    }

    this.handleWrong(drag.card);
  };

  private cancelDrag = (): void => {
    const drag = this.dragState;
    if (!drag) return;
    this.detachDragListeners(drag.card);
    this.handleWrong(drag.card);
  };

  private detachDragListeners(card: HTMLElement): void {
    card.classList.remove("is-dragging");
    window.removeEventListener("pointermove", this.moveDrag);
    window.removeEventListener("pointerup", this.endDrag);
    window.removeEventListener("pointercancel", this.cancelDrag);
    this.dragState = undefined;
  }

  private findSlotAt(clientX: number, clientY: number, dragged?: HTMLElement): HTMLElement | undefined {
    const slots = Array.from(this.context.root.querySelectorAll<HTMLElement>("[data-slot-index]"));
    if (dragged) {
      const draggedRect = dragged.getBoundingClientRect();
      const best = slots
        .map((slot) => ({ slot, score: this.overlapScore(draggedRect, slot.getBoundingClientRect()) }))
        .sort((left, right) => right.score - left.score)[0];
      if (best && best.score >= 0.35) return best.slot;
    }
    return slots.find((slot) => {
      const rect = slot.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    });
  }

  private currentRound(): ChoiceRound {
    return this.context.content.rounds[this.roundOrder[this.roundIndex] ?? this.roundIndex];
  }

  private overlapScore(a: DOMRect, b: DOMRect): number {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const overlap = width * height;
    const smaller = Math.min(a.width * a.height, b.width * b.height);
    return smaller > 0 ? overlap / smaller : 0;
  }

  private canPlaceInSlot(slot: HTMLElement, card: HTMLElement): boolean {
    const index = Number(slot.dataset.slotIndex);
    return !this.placedParts.has(index) && slot.dataset.expectedPartId === card.dataset.partId;
  }

  private placeCard(slot: HTMLElement, card: HTMLElement): void {
    const index = Number(slot.dataset.slotIndex);
    const partId = card.dataset.partId ?? "";
    this.placedParts.set(index, partId);
    slot.classList.add("has-part");
    slot.replaceChildren();
    const partLabel = card.querySelector("strong")?.textContent ?? card.textContent ?? "";
    slot.textContent = partLabel;
    card.dataset.placed = "true";
    card.classList.add("is-placed");
    card.style.transform = "translate(0, 0)";
    card.style.visibility = "hidden";
    this.checkCompletion(this.currentRound());
  }

  private handleWrong(card: HTMLElement): void {
    card.classList.add("is-neutral-wrong");
    card.style.transform = "translate(0, 0)";
    this.context.onNeutral();
    window.setTimeout(() => card.classList.remove("is-neutral-wrong"), 750);
  }

  private checkCompletion(round: ChoiceRound): void {
    if (!round.correctSequence) return;
    const wordsComplete = this.placedParts.size === round.correctSequence.length;
    const punctuationComplete = !round.correctPunctuation || this.selectedPunctuation === round.correctPunctuation;
    if (wordsComplete && punctuationComplete) this.handleCompleteSentence(round);
  }

  private handleCompleteSentence(round: ChoiceRound): void {
    if (this.locked) return;
    this.locked = true;
    const sentence = round.sentence ?? "";
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(`${round.praise} ${sentence}`).then(() => this.advance());
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
    text.textContent = "You fixed all the sentences.";
    const replay = this.button("Play Again", "primary-action");
    replay.addEventListener("click", () => this.mount());
    panel.append(title, text);
    this.appendCompletionNavigation(panel, replay);
    this.context.root.append(panel);
  }
}

