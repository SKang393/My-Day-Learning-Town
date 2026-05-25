import { BaseTemplate, type TemplateContext } from "./BaseTemplate";
import type { ChoiceRound } from "../contentTypes";
import { resolveAssetPath } from "../systems/assetPath";
import { shuffled } from "./templateUtils";

export class DragIntoSlotsTemplate extends BaseTemplate {
  private roundIndex = 0;
  private locked = false;
  private placedLetters = new Map<number, string>();
  private roundOrder: number[] = [];
  private dragState?: {
    pointerId: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    tile: HTMLElement;
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
    row.className = model.sceneImage ? "model-row model-scene-row" : "model-row";
    if (model.sceneImage) {
      row.append(this.modelScene(model.sceneImage));
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
      img.src = resolveAssetPath(image);
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
    img.src = resolveAssetPath(image);
    img.alt = "";
    card.append(img);
    return card;
  }

  private renderRound(): void {
    this.locked = false;
    this.placedLetters.clear();
    const round = this.currentRound();
    this.context.root.replaceChildren();
    this.context.onDirections(`${round.instruction} Progress: ${this.roundIndex + 1}/${this.context.content.rounds.length}.`);

    if (!round.word || !round.wordImage || !round.letters || !round.sounds || !round.tiles) {
      this.context.root.innerHTML = `<section class="game-card"><h2>CVC Build Tray</h2><p>This round needs a word, picture, letters, sounds, and tiles.</p></section>`;
      return;
    }

    const stage = document.createElement("section");
    stage.className = "game-card cvc-card";
    stage.dataset.testid = "cvc-stage";

    const picturePanel = document.createElement("div");
    picturePanel.className = "cvc-picture-panel";
    const image = document.createElement("img");
    image.src = resolveAssetPath(round.wordImage);
    image.alt = "";
    const saySounds = this.button("", "sound-action speaker-icon-button");
    saySounds.innerHTML = "&#128266;";
    saySounds.setAttribute("aria-label", "Say sounds");
    saySounds.dataset.testid = "say-sounds";
    saySounds.addEventListener("click", () => this.context.onSpeak(this.soundsText(round)));
    picturePanel.append(image, saySounds);

    const slots = document.createElement("div");
    slots.className = "cvc-slot-row";
    const matchColors = ["#006d9c", "#1f8a4c", "#c93636"];
    round.letters.slice(0, 3).forEach((letter, index) => {
      const slot = document.createElement("div");
      slot.className = "cvc-slot";
      slot.dataset.slotIndex = String(index);
      slot.dataset.expectedLetter = letter;
      slot.dataset.testid = `cvc-slot-${index}`;
      slot.style.setProperty("--match-color", matchColors[index % matchColors.length]);
      slot.innerHTML = "";
      slots.append(slot);
    });

    const tray = document.createElement("div");
    tray.className = "letter-tray";
    shuffled(round.tiles.slice(0, 6)).forEach((tile) => {
      const letterTile = document.createElement("div");
      letterTile.className = "letter-tile";
      letterTile.dataset.tileId = tile.id;
      letterTile.dataset.letter = tile.label;
      letterTile.dataset.testid = `letter-tile-${tile.id}`;
      letterTile.setAttribute("role", "button");
      letterTile.setAttribute("tabindex", "0");
      letterTile.setAttribute("aria-label", `Drag letter ${tile.label}`);
      const expectedIndex = round.letters?.indexOf(tile.label) ?? -1;
      if (expectedIndex >= 0) letterTile.style.setProperty("--match-color", matchColors[expectedIndex % matchColors.length]);
      letterTile.textContent = tile.label;
      letterTile.addEventListener("pointerdown", (event) => this.startDrag(event, letterTile));
      tray.append(letterTile);
    });

    stage.append(picturePanel, slots, tray);
    this.context.root.append(stage);
  }

  private currentRound(): ChoiceRound {
    return this.context.content.rounds[this.roundOrder[this.roundIndex] ?? this.roundIndex];
  }

  private soundsText(round: ChoiceRound): string {
    return round.sounds && round.word ? `${round.word}. ${round.sounds.join(", ")}. ${round.word}.` : round.instruction;
  }

  private startDrag(event: PointerEvent, tile: HTMLElement): void {
    if (this.locked || tile.dataset.placed === "true") return;
    event.preventDefault();
    tile.setPointerCapture(event.pointerId);
    tile.classList.add("is-dragging");
    this.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: 0,
      currentY: 0,
      tile,
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
    drag.tile.style.transform = `translate(${drag.currentX}px, ${drag.currentY}px)`;
  };

  private endDrag = (event: PointerEvent): void => {
    const drag = this.dragState;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const slot = this.findSlotAt(event.clientX, event.clientY, drag.tile);
    this.detachDragListeners(drag.tile);

    if (slot && this.canPlaceInSlot(slot, drag.tile)) {
      this.placeTile(slot, drag.tile);
      return;
    }

    this.handleWrong(drag.tile);
  };

  private cancelDrag = (): void => {
    const drag = this.dragState;
    if (!drag) return;
    this.detachDragListeners(drag.tile);
    this.handleWrong(drag.tile);
  };

  private detachDragListeners(tile: HTMLElement): void {
    tile.classList.remove("is-dragging");
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

  private overlapScore(a: DOMRect, b: DOMRect): number {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const overlap = width * height;
    const smaller = Math.min(a.width * a.height, b.width * b.height);
    return smaller > 0 ? overlap / smaller : 0;
  }

  private canPlaceInSlot(slot: HTMLElement, tile: HTMLElement): boolean {
    const index = Number(slot.dataset.slotIndex);
    return !this.placedLetters.has(index) && slot.dataset.expectedLetter === tile.dataset.letter;
  }

  private placeTile(slot: HTMLElement, tile: HTMLElement): void {
    const index = Number(slot.dataset.slotIndex);
    const letter = tile.dataset.letter ?? "";
    this.placedLetters.set(index, letter);
    slot.classList.add("has-letter");
    slot.textContent = letter;
    tile.dataset.placed = "true";
    tile.classList.add("is-placed");
    tile.style.transform = "translate(0, 0)";
    tile.style.visibility = "hidden";

    const round = this.currentRound();
    if (round.letters && this.placedLetters.size === round.letters.length) {
      this.handleCompleteWord(round);
    }
  }

  private handleWrong(tile: HTMLElement): void {
    tile.classList.add("is-neutral-wrong");
    tile.style.transform = "translate(0, 0)";
    this.context.onNeutral();
    window.setTimeout(() => tile.classList.remove("is-neutral-wrong"), 750);
  }

  private handleCompleteWord(round: ChoiceRound): void {
    this.locked = true;
    const word = round.word ?? "word";
    const spokenWord = word.charAt(0).toUpperCase() + word.slice(1);
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(`${round.praise} ${spokenWord}.`).then(() => this.advance());
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
    text.textContent = "You built all the words.";
    const replay = this.button("Play Again", "primary-action");
    replay.addEventListener("click", () => this.mount());
    panel.append(title, text);
    this.appendCompletionNavigation(panel, replay);
    this.context.root.append(panel);
  }
}
