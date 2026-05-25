import { BaseTemplate, type TemplateContext } from "./BaseTemplate";
import type { ChoiceRound } from "../contentTypes";
import { resolveAssetPath } from "../systems/assetPath";
import { makeChoiceVisual, recordChoiceDistribution, shuffled } from "./templateUtils";

export class DragMatchTemplate extends BaseTemplate {
  private roundIndex = 0;
  private locked = false;
  private placedCount = 0;
  private answerComplete = false;
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
      row.append(
        this.modelPicture(model.targetImage, model.targetWord),
        this.modelConnector(model.arrowLabel),
        this.modelPicture(model.matchingImage, model.matchingLabel),
      );
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
    this.placedCount = 0;
    this.answerComplete = false;
    const round = this.currentRound();
    this.context.root.replaceChildren();
    this.context.onDirections(`${round.instruction} Progress: ${this.roundIndex + 1}/${this.context.content.rounds.length}.`);

    if (round.mode === "make-set") {
      this.renderMakeSetRound(round);
      return;
    }

    if (round.mode === "measure-objects") {
      this.renderMeasureObjectsRound(round);
      return;
    }

    if (round.mode === "add-to-story") {
      this.renderAddStoryRound(round);
      return;
    }

    if (round.mode === "subtract-story") {
      this.renderSubtractStoryRound(round);
      return;
    }

    if (!round.bins || !round.item || !round.correctBinId) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Drag and Match</h2><p>This round needs bins, an item, and a correct bin.</p></section>`;
      return;
    }

    const isScienceSort = round.mode === "material-sort" || round.mode === "map-builder" || round.mode === "water-earth" || round.mode === "shape-sort";
    const isThenNow = round.mode === "then-now";
    const stage = document.createElement("section");
    stage.className = `game-card rhyme-card ${isScienceSort ? "science-sort-card" : ""} ${isThenNow ? "then-now-card" : ""} ${round.mode ? `${round.mode}-card` : ""}`;
    stage.dataset.testid = "rhyme-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const prompt = document.createElement("h2");
    prompt.className = "rhyme-prompt";
    prompt.textContent = round.prompt;

    const promptWrap = document.createElement("div");
    promptWrap.className = "prompt-area";
    if (round.targetImage) {
      const target = document.createElement("img");
      target.className = "target-picture";
      target.src = resolveAssetPath(round.targetImage);
      target.alt = "";
      promptWrap.append(target);
    }
    promptWrap.append(prompt);

    const bins = document.createElement("div");
    bins.className = `rhyme-bin-grid ${isScienceSort ? "science-bin-grid" : ""} ${isThenNow ? "then-now-bin-grid" : ""}`;
    const matchColors = ["#006d9c", "#1f8a4c", "#c93636"];
    const binColors = new Map(round.bins.slice(0, 3).map((bin, index) => [bin.id, matchColors[index % matchColors.length]]));
    shuffled(round.bins.slice(0, 3)).forEach((bin) => {
      const house = document.createElement("div");
      house.className = `rhyme-house ${isScienceSort ? "science-bin" : ""} ${isThenNow ? "then-now-bin" : ""}`;
      house.dataset.binId = bin.id;
      house.dataset.testid = `rhyme-bin-${bin.id}`;
      house.style.setProperty("--match-color", binColors.get(bin.id) ?? "#10232f");
      const detail = round.mode === "map-builder" ? "map spot" : "sort bin";
      const imageMarkup = bin.image ? `<img class="bin-icon" src="${resolveAssetPath(bin.image)}" alt="" />` : "";
      house.innerHTML = isScienceSort || isThenNow
        ? `<div class="house-body science-bin-body">${imageMarkup}<strong>${bin.label}</strong>${isThenNow ? "" : `<span>${detail}</span>`}</div>`
        : `<div class="house-roof"></div><div class="house-body">${imageMarkup}<strong>${bin.label}</strong><span>rhyme house</span></div>`;
      bins.append(house);
    });

    const itemZone = document.createElement("div");
    itemZone.className = "drag-item-zone";
    const item = this.makePictureCard(round.item.label, round.item.image, "drag-item");
    item.style.setProperty("--match-color", binColors.get(round.correctBinId) ?? "#10232f");
    item.addEventListener("pointerdown", (event) => this.startDrag(event, item));
    itemZone.append(item);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, promptWrap, bins, itemZone, progress);
    this.context.root.append(stage);
  }

  private currentRound(): ChoiceRound {
    return this.context.content.rounds[this.roundOrder[this.roundIndex] ?? this.roundIndex];
  }

  private renderSubtractStoryRound(round: ChoiceRound): void {
    if (
      round.startCount === undefined ||
      round.removeCount === undefined ||
      round.totalCount === undefined ||
      !round.objectName ||
      !round.objectImage ||
      !round.options ||
      !round.correctChoiceId
    ) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Subtraction Story Mat</h2><p>This round needs start count, remove count, total, object, image, and choices.</p></section>`;
      return;
    }

    const stage = document.createElement("section");
    stage.className = "game-card add-story-card subtract-story-card";
    stage.dataset.testid = "subtract-story-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const prompt = document.createElement("h2");
    prompt.className = "add-story-prompt";
    prompt.textContent = round.prompt;

    const workArea = document.createElement("div");
    workArea.className = "add-story-work-area";

    const mat = document.createElement("div");
    mat.className = "story-mat-area";
    mat.dataset.testid = "subtract-mat-area";
    const label = document.createElement("strong");
    label.textContent = round.storyMatLabel ?? "story mat";
    const countLabel = document.createElement("span");
    countLabel.dataset.testid = "subtract-count-label";
    countLabel.className = "story-count-cue";
    countLabel.append(this.makeNumberCue(round.startCount));
    const items = document.createElement("div");
    items.className = "story-mat-items";
    items.dataset.testid = "subtract-mat-items";
    for (let index = 0; index < round.startCount; index += 1) {
      const card = this.makePictureCard(round.objectName, round.objectImage, `subtract-object-${index + 1}`);
      card.classList.add("subtract-object-card");
      card.dataset.objectIndex = String(index + 1);
      card.addEventListener("pointerdown", (event) => this.startDrag(event, card));
      items.append(card);
    }
    mat.append(label, countLabel, items);

    const takeAway = document.createElement("div");
    takeAway.className = "take-away-area";
    takeAway.dataset.testid = "take-away-area";
    takeAway.innerHTML = `<span data-testid="take-away-count"></span>`;
    takeAway.querySelector<HTMLElement>("[data-testid='take-away-count']")?.append(this.makeNumberCue(0));

    workArea.append(mat, takeAway);

    const equation = document.createElement("p");
    equation.className = "equation-panel is-hidden";
    equation.dataset.testid = "subtract-equation";
    equation.textContent = "";

    const answerPanel = document.createElement("div");
    answerPanel.className = "add-answer-panel is-hidden";
    answerPanel.dataset.testid = "subtract-answer-panel";
    const answerPrompt = document.createElement("p");
    answerPrompt.textContent = "How many are left?";
    const answerGrid = document.createElement("div");
    answerGrid.className = "add-answer-grid";
    const options = shuffled(round.options.slice(0, 3));
    recordChoiceDistribution(this.context.content.id, round.id, options, round.correctChoiceId);
    options.forEach((option, index) => {
      const button = this.button("", "add-answer-button");
      button.setAttribute("aria-label", option.label);
      button.dataset.choiceId = option.id;
      button.dataset.optionIndex = String(index);
      button.dataset.testid = `subtract-answer-${option.id}`;
      button.prepend(this.makeNumberCue(Number(option.id || option.label)));
      button.addEventListener("click", () => this.chooseSubtractStoryAnswer(round, button, option.id));
      answerGrid.append(button);
    });
    answerPanel.append(answerPrompt, answerGrid);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, prompt, workArea, equation, answerPanel, progress);
    this.context.root.append(stage);
  }

  private renderAddStoryRound(round: ChoiceRound): void {
    if (
      round.startCount === undefined ||
      round.addCount === undefined ||
      round.totalCount === undefined ||
      !round.objectName ||
      !round.objectImage ||
      !round.options ||
      !round.correctChoiceId
    ) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Add To Story Mat</h2><p>This round needs start count, add count, total, object, image, and choices.</p></section>`;
      return;
    }

    const stage = document.createElement("section");
    stage.className = "game-card add-story-card";
    stage.dataset.testid = "add-story-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const prompt = document.createElement("h2");
    prompt.className = "add-story-prompt";
    prompt.textContent = round.prompt;

    const workArea = document.createElement("div");
    workArea.className = "add-story-work-area";

    const mat = document.createElement("div");
    mat.className = "story-mat-area";
    mat.dataset.testid = "story-mat-area";
    const label = document.createElement("strong");
    label.textContent = round.storyMatLabel ?? "story mat";
    const countLabel = document.createElement("span");
    countLabel.dataset.testid = "story-count-label";
    countLabel.className = "story-count-cue";
    countLabel.append(this.makeNumberCue(round.startCount));
    const items = document.createElement("div");
    items.className = "story-mat-items";
    items.dataset.testid = "story-mat-items";
    for (let index = 0; index < round.startCount; index += 1) {
      items.append(this.makeSmallObjectImage(round.objectImage));
    }
    mat.append(label, countLabel, items);

    const tray = document.createElement("div");
    tray.className = "add-object-tray";
    tray.dataset.testid = "add-object-tray";
    for (let index = 0; index < round.addCount; index += 1) {
      const card = this.makePictureCard(round.objectName, round.objectImage, `add-object-${index + 1}`);
      card.classList.add("add-story-object-card");
      card.dataset.objectIndex = String(index + 1);
      card.addEventListener("pointerdown", (event) => this.startDrag(event, card));
      tray.append(card);
    }

    workArea.append(mat, tray);

    const equation = document.createElement("p");
    equation.className = "equation-panel is-hidden";
    equation.dataset.testid = "add-equation";
    equation.textContent = "";

    const answerPanel = document.createElement("div");
    answerPanel.className = "add-answer-panel is-hidden";
    answerPanel.dataset.testid = "add-answer-panel";
    const answerPrompt = document.createElement("p");
    answerPrompt.textContent = "How many all together?";
    const answerGrid = document.createElement("div");
    answerGrid.className = "add-answer-grid";
    const options = shuffled(round.options.slice(0, 3));
    recordChoiceDistribution(this.context.content.id, round.id, options, round.correctChoiceId);
    options.forEach((option, index) => {
      const button = this.button("", "add-answer-button");
      button.setAttribute("aria-label", option.label);
      button.dataset.choiceId = option.id;
      button.dataset.optionIndex = String(index);
      button.dataset.testid = `add-answer-${option.id}`;
      button.prepend(this.makeNumberCue(Number(option.id || option.label)));
      button.addEventListener("click", () => this.chooseAddStoryAnswer(round, button, option.id));
      answerGrid.append(button);
    });
    answerPanel.append(answerPrompt, answerGrid);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, prompt, workArea, equation, answerPanel, progress);
    this.context.root.append(stage);
  }

  private renderMakeSetRound(round: ChoiceRound): void {
    if (!round.targetCount || !round.objectName || !round.objectImage || !round.totalObjects) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Make a Set</h2><p>This round needs a target count, object, image, and object total.</p></section>`;
      return;
    }

    const stage = document.createElement("section");
    stage.className = "game-card make-set-card";
    stage.dataset.testid = "make-set-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const promptRow = document.createElement("div");
    promptRow.className = "make-set-prompt-row";
    const number = document.createElement("div");
    number.className = "target-number";
    number.dataset.testid = "target-number";
    number.append(this.makeNumberCue(round.targetCount));
    const prompt = document.createElement("h2");
    prompt.className = "make-set-prompt";
    prompt.textContent = round.prompt;
    promptRow.append(number, prompt);

    const workArea = document.createElement("div");
    workArea.className = "make-set-work-area";

    const target = document.createElement("div");
    target.className = "set-target-area ten-frame-area";
    target.dataset.testid = "set-target-area";
    target.innerHTML = `<span data-testid="set-count-label" class="visually-hidden">0 in the frame</span><div class="ten-frame-grid" data-testid="set-count-items"></div>`;
    const frame = target.querySelector<HTMLElement>("[data-testid='set-count-items']");
    for (let index = 0; index < 10; index += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "ten-frame-cell";
      cell.dataset.cellIndex = String(index);
      cell.dataset.testid = `ten-frame-cell-${index + 1}`;
      cell.addEventListener("click", () => this.removeFromFrame(cell, round));
      frame?.append(cell);
    }

    const tray = document.createElement("div");
    tray.className = "set-object-tray";
    for (let index = 0; index < round.totalObjects; index += 1) {
      const card = this.makePictureCard(round.objectName, round.objectImage, `set-object-${index + 1}`);
      card.classList.add("set-object-card");
      card.dataset.objectIndex = String(index + 1);
      card.addEventListener("pointerdown", (event) => this.startDrag(event, card));
      tray.append(card);
    }

    workArea.append(target, tray);

    const checkPanel = document.createElement("div");
    checkPanel.className = "check-panel";
    const message = document.createElement("p");
    message.dataset.testid = "set-check-message";
    message.textContent = "Fill the frame, then press Done.";
    const done = this.button("Done", "primary-action done-button");
    done.dataset.testid = "set-done-button";
    done.addEventListener("click", () => this.checkSetFrame(round));
    checkPanel.append(message, done);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    stage.append(contextLine, promptRow, workArea, checkPanel, progress);
    this.context.root.append(stage);
  }

  private renderMeasureObjectsRound(round: ChoiceRound): void {
    if (!round.measureCount || !round.objectName || !round.objectImage || !round.unitName || !round.unitImage || !round.totalObjects) {
      this.context.root.innerHTML = `<section class="game-card"><h2>Measure With Objects</h2><p>This round needs object, unit, target count, and total units.</p></section>`;
      return;
    }

    const stage = document.createElement("section");
    stage.className = "game-card measure-objects-card";
    stage.dataset.testid = "measure-objects-stage";

    const contextLine = document.createElement("p");
    contextLine.className = "context-line";
    contextLine.textContent = round.context;

    const prompt = document.createElement("h2");
    prompt.className = "make-set-prompt";
    prompt.textContent = round.answerPrompt ?? round.prompt;

    const workArea = document.createElement("div");
    workArea.className = "measure-work-area";

    const objectPanel = document.createElement("div");
    objectPanel.className = "measure-object-panel";
    objectPanel.innerHTML = `<img src="${resolveAssetPath(round.objectImage)}" alt="" />`;

    const target = document.createElement("div");
    target.className = "measure-target-area";
    target.dataset.testid = "measure-target-area";
    target.innerHTML = `<span data-testid="measure-count-label" class="visually-hidden">0 units placed</span><div class="measure-unit-row" data-testid="measure-unit-row"></div>`;
    const row = target.querySelector<HTMLElement>("[data-testid='measure-unit-row']");
    if (row) row.style.gridTemplateColumns = `repeat(${round.measureCount}, minmax(42px, 1fr))`;
    for (let index = 0; index < round.measureCount; index += 1) {
      const cell = document.createElement("div");
      cell.className = "measure-unit-cell";
      cell.dataset.cellIndex = String(index);
      cell.dataset.testid = `measure-cell-${index + 1}`;
      row?.append(cell);
    }

    const tray = document.createElement("div");
    tray.className = "set-object-tray measure-unit-tray";
    tray.dataset.testid = "measure-unit-tray";
    for (let index = 0; index < round.totalObjects; index += 1) {
      const card = this.makePictureCard(round.unitName, round.unitImage, `measure-unit-${index + 1}`);
      card.classList.add("set-object-card", "measure-unit-card");
      card.dataset.objectIndex = String(index + 1);
      card.addEventListener("pointerdown", (event) => this.startDrag(event, card));
      tray.append(card);
    }

    workArea.append(objectPanel, target, tray);

    const answerPanel = document.createElement("div");
    answerPanel.className = "measure-answer-panel is-hidden";
    answerPanel.dataset.testid = "measure-answer-panel";
    const answerPrompt = document.createElement("p");
    answerPrompt.textContent = round.answerPrompt ?? `How long is the ${round.objectName}?`;
    const answerGrid = document.createElement("div");
    answerGrid.className = "measure-answer-grid";
    const options = shuffled((round.options ?? []).slice(0, 3));
    recordChoiceDistribution(this.context.content.id, round.id, options, round.correctChoiceId);
    options.forEach((option, index) => {
      const button = this.button("", "measure-answer-button");
      button.setAttribute("aria-label", option.label);
      button.dataset.choiceId = option.id;
      button.dataset.optionIndex = String(index);
      button.dataset.testid = `measure-answer-${option.id}`;
      if (option.count && round.unitImage) {
        button.prepend(this.makeQuantityPreview(option.count, round.unitImage));
      } else {
        button.prepend(makeChoiceVisual(option.label, "answer-symbol-visual"));
      }
      button.addEventListener("click", () => this.chooseMeasureAnswer(round, button, option.id));
      answerGrid.append(button);
    });
    answerPrompt.className = "visually-hidden";
    answerPanel.append(answerPrompt, answerGrid);

    const progress = document.createElement("p");
    progress.className = "round-progress";
    progress.textContent = `Round ${this.roundIndex + 1} of ${this.context.content.rounds.length}`;

    const checkPanel = document.createElement("div");
    checkPanel.className = "check-panel";
    const message = document.createElement("p");
    message.dataset.testid = "measure-check-message";
    message.textContent = "Measure, then press Done.";
    const done = this.button("Done", "primary-action done-button");
    done.dataset.testid = "measure-done-button";
    done.addEventListener("click", () => this.checkMeasureRow(round));
    checkPanel.append(message, done);

    stage.append(contextLine, prompt, workArea, checkPanel, answerPanel, progress);
    this.context.root.append(stage);
  }

  private makePictureCard(label: string, image: string | undefined, testId: string): HTMLElement {
    const item = document.createElement("div");
    item.className = "drag-picture-card";
    item.dataset.testid = testId;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Drag ${label}`);
    if (image) {
      const img = document.createElement("img");
      img.src = resolveAssetPath(image);
      img.alt = "";
      item.append(img);
    }
    if (!image) {
      const text = document.createElement("strong");
      text.textContent = label;
      item.append(text);
    }
    return item;
  }

  private makeSmallObjectImage(image: string): HTMLImageElement {
    const img = document.createElement("img");
    img.src = resolveAssetPath(image);
    img.alt = "";
    return img;
  }

  private makeQuantityPreview(count: number, image: string): HTMLElement {
    const preview = document.createElement("span");
    preview.className = "quantity-preview";
    preview.setAttribute("aria-hidden", "true");
    for (let index = 0; index < count; index += 1) {
      preview.append(this.makeSmallObjectImage(image));
    }
    return preview;
  }

  private makeNumberCue(value: number): HTMLElement {
    const cue = document.createElement("span");
    cue.className = "number-answer-cue";
    const number = document.createElement("b");
    number.textContent = Number.isFinite(value) ? String(value) : "?";
    const dots = document.createElement("span");
    dots.className = "number-answer-dots";
    const count = Number.isFinite(value) ? Math.min(30, Math.max(0, value)) : 0;
    for (let index = 0; index < count; index += 1) {
      dots.append(document.createElement("i"));
    }
    cue.append(dots, number);
    return cue;
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
    const round = this.currentRound();
    const dragRect = drag.card.getBoundingClientRect();
    this.detachDragListeners(drag.card);

    if (round.mode === "make-set") {
      const target = this.findTargetAt(event.clientX, event.clientY, dragRect);
      if (target) {
        this.placeSetObject(round, drag.card, target);
        return;
      }
      this.handleWrong(drag.card);
      return;
    }

    if (round.mode === "measure-objects") {
      const target = this.findMeasureTargetAt(event.clientX, event.clientY, dragRect);
      if (target) {
        this.placeMeasureUnit(round, drag.card, target);
        return;
      }
      this.handleWrong(drag.card);
      return;
    }

    if (round.mode === "add-to-story") {
      const target = this.findStoryMatAt(event.clientX, event.clientY, dragRect);
      if (target) {
        this.placeAddStoryObject(round, drag.card, target);
        return;
      }
      this.handleWrong(drag.card);
      return;
    }

    if (round.mode === "subtract-story") {
      const target = this.findTakeAwayAt(event.clientX, event.clientY, dragRect);
      if (target) {
        this.placeSubtractStoryObject(round, drag.card, target);
        return;
      }
      this.handleWrong(drag.card);
      return;
    }

    const bin = this.findBinAt(event.clientX, event.clientY, dragRect);
    if (bin && bin.dataset.binId === round.correctBinId) {
      this.handleCorrect(round, drag.card, bin);
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

  private findBinAt(clientX: number, clientY: number, draggedRect?: DOMRect): HTMLElement | undefined {
    const bins = Array.from(this.context.root.querySelectorAll<HTMLElement>("[data-bin-id]"));
    const byOverlap = this.bestOverlap(bins, draggedRect);
    if (byOverlap) return byOverlap;
    return bins.find((bin) => this.pointInElement(clientX, clientY, bin));
  }

  private findTargetAt(clientX: number, clientY: number, draggedRect?: DOMRect): HTMLElement | undefined {
    const target = this.context.root.querySelector<HTMLElement>("[data-testid='set-target-area']");
    return target && (this.pointInElement(clientX, clientY, target) || this.overlapScore(draggedRect, target.getBoundingClientRect()) >= 0.35) ? target : undefined;
  }

  private findStoryMatAt(clientX: number, clientY: number, draggedRect?: DOMRect): HTMLElement | undefined {
    const target = this.context.root.querySelector<HTMLElement>("[data-testid='story-mat-area']");
    return target && (this.pointInElement(clientX, clientY, target) || this.overlapScore(draggedRect, target.getBoundingClientRect()) >= 0.35) ? target : undefined;
  }

  private findTakeAwayAt(clientX: number, clientY: number, draggedRect?: DOMRect): HTMLElement | undefined {
    const target = this.context.root.querySelector<HTMLElement>("[data-testid='take-away-area']");
    return target && (this.pointInElement(clientX, clientY, target) || this.overlapScore(draggedRect, target.getBoundingClientRect()) >= 0.35) ? target : undefined;
  }

  private findMeasureTargetAt(clientX: number, clientY: number, draggedRect?: DOMRect): HTMLElement | undefined {
    const target = this.context.root.querySelector<HTMLElement>("[data-testid='measure-target-area']");
    return target && (this.pointInElement(clientX, clientY, target) || this.overlapScore(draggedRect, target.getBoundingClientRect()) >= 0.35) ? target : undefined;
  }

  private pointInElement(clientX: number, clientY: number, element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }

  private bestOverlap(elements: HTMLElement[], draggedRect?: DOMRect): HTMLElement | undefined {
    if (!draggedRect) return undefined;
    const best = elements.map((element) => ({ element, score: this.overlapScore(draggedRect, element.getBoundingClientRect()) })).sort((left, right) => right.score - left.score)[0];
    return best && best.score >= 0.35 ? best.element : undefined;
  }

  private overlapScore(a: DOMRect | undefined, b: DOMRect): number {
    if (!a) return 0;
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const overlap = width * height;
    const smaller = Math.min(a.width * a.height, b.width * b.height);
    return smaller > 0 ? overlap / smaller : 0;
  }

  private placeSetObject(round: ChoiceRound, card: HTMLElement, target: HTMLElement): void {
    const cell = this.firstEmptyCell("[data-testid='set-count-items'] .ten-frame-cell");
    if (!cell) {
      this.handleWrong(card);
      return;
    }

    this.placedCount += 1;
    card.dataset.placed = "true";
    card.classList.add("is-placed");
    card.style.visibility = "hidden";
    card.style.transform = "translate(0, 0)";

    this.fillCell(cell, round.objectImage ?? "", card.dataset.testid ?? "");
    const countLabel = target.querySelector<HTMLElement>("[data-testid='set-count-label']");
    if (countLabel) countLabel.textContent = `${this.placedCount} in the frame`;
    this.clearFrameFeedback();
    this.context.onSpeak(String(this.placedCount));
  }

  private placeMeasureUnit(round: ChoiceRound, card: HTMLElement, target: HTMLElement): void {
    const cell = this.firstEmptyCell("[data-testid='measure-unit-row'] .measure-unit-cell");
    if (!cell) {
      this.handleWrong(card);
      return;
    }

    this.placedCount += 1;
    card.dataset.placed = "true";
    card.classList.add("is-placed");
    card.style.visibility = "hidden";
    card.style.transform = "translate(0, 0)";

    this.fillCell(cell, round.unitImage ?? "", card.dataset.testid ?? "");
    const countLabel = target.querySelector<HTMLElement>("[data-testid='measure-count-label']");
    if (countLabel) countLabel.textContent = `${this.placedCount} units placed`;
    this.clearFrameFeedback();
    this.context.onSpeak(String(this.placedCount));
  }

  private firstEmptyCell(selector: string): HTMLElement | undefined {
    return Array.from(this.context.root.querySelectorAll<HTMLElement>(selector)).find((cell) => !cell.dataset.filled);
  }

  private fillCell(cell: HTMLElement, image: string, sourceTestId: string): void {
    cell.dataset.filled = "true";
    cell.dataset.sourceTestId = sourceTestId;
    cell.classList.add("is-filled");
    cell.replaceChildren(this.makeSmallObjectImage(image));
  }

  private removeFromFrame(cell: HTMLElement, round: ChoiceRound): void {
    if (this.locked || !cell.dataset.filled) return;
    const sourceId = cell.dataset.sourceTestId;
    if (sourceId) {
      const source = this.context.root.querySelector<HTMLElement>(`[data-testid='${sourceId}']`);
      if (source) {
        source.dataset.placed = "false";
        source.style.visibility = "";
        source.classList.remove("is-placed");
      }
    }
    cell.replaceChildren();
    delete cell.dataset.filled;
    delete cell.dataset.sourceTestId;
    cell.classList.remove("is-filled", "is-extra", "is-needed");
    this.placedCount = Math.max(0, this.placedCount - 1);
    const setLabel = this.context.root.querySelector<HTMLElement>("[data-testid='set-count-label']");
    if (setLabel && round.targetCount) setLabel.textContent = `${this.placedCount} in the frame`;
    const measureLabel = this.context.root.querySelector<HTMLElement>("[data-testid='measure-count-label']");
    if (measureLabel && round.measureCount) measureLabel.textContent = `${this.placedCount} units placed`;
    this.clearFrameFeedback();
  }

  private clearFrameFeedback(): void {
    this.context.root.querySelectorAll(".is-extra, .is-needed").forEach((item) => item.classList.remove("is-extra", "is-needed"));
  }

  private checkSetFrame(round: ChoiceRound): void {
    const targetCount = round.targetCount ?? 0;
    const cells = Array.from(this.context.root.querySelectorAll<HTMLElement>("[data-testid='set-count-items'] .ten-frame-cell"));
    this.checkCount(round, targetCount, cells, "set-check-message");
  }

  private checkMeasureRow(round: ChoiceRound): void {
    const targetCount = round.measureCount ?? 0;
    const cells = Array.from(this.context.root.querySelectorAll<HTMLElement>("[data-testid='measure-unit-row'] .measure-unit-cell"));
    this.clearFrameFeedback();
    const message = this.context.root.querySelector<HTMLElement>("[data-testid='measure-check-message']");
    if (this.placedCount === targetCount) {
      this.locked = true;
      if (message) message.textContent = "That matches the object. Now answer.";
      this.context.root.querySelector<HTMLElement>("[data-testid='measure-answer-panel']")?.classList.remove("is-hidden");
      this.context.onSpeak(round.answerPrompt ?? `How long is the ${round.objectName}?`);
      return;
    }

    if (this.placedCount < targetCount) {
      cells.slice(this.placedCount, targetCount).forEach((cell) => cell.classList.add("is-needed"));
      if (message) message.textContent = `We need ${targetCount - this.placedCount} more.`;
      this.context.onSpeak(targetCount - this.placedCount === 1 ? "We need one more." : "Let's check together.");
      return;
    }

    cells.slice(targetCount, this.placedCount).forEach((cell) => cell.classList.add("is-extra"));
    if (message) message.textContent = "Too many. Let's take some away.";
    this.context.onSpeak("Too many. Let's take some away.");
  }

  private chooseMeasureAnswer(round: ChoiceRound, button: HTMLElement, choiceId: string): void {
    if (!this.locked || this.answerComplete) return;
    if (choiceId !== round.correctChoiceId) {
      button.classList.add("is-neutral-wrong");
      this.context.onNeutral();
      window.setTimeout(() => button.classList.remove("is-neutral-wrong"), 750);
      return;
    }

    button.classList.add("is-correct");
    this.answerComplete = true;
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(round.praise).then(() => this.advance());
  }

  private checkCount(round: ChoiceRound, targetCount: number, cells: HTMLElement[], messageTestId: string): void {
    this.clearFrameFeedback();
    const message = this.context.root.querySelector<HTMLElement>(`[data-testid='${messageTestId}']`);
    if (this.placedCount === targetCount) {
      this.locked = true;
      if (message) message.textContent = "That is right.";
      this.context.onRoundComplete(this.roundIndex);
      void this.context.onPraise(round.praise).then(() => this.advance());
      return;
    }

    if (this.placedCount < targetCount) {
      cells.slice(this.placedCount, targetCount).forEach((cell) => cell.classList.add("is-needed"));
      if (message) message.textContent = `We need ${targetCount - this.placedCount} more.`;
      this.context.onSpeak(targetCount - this.placedCount === 1 ? "We need one more." : "Let's check together.");
      return;
    }

    cells.slice(targetCount, this.placedCount).forEach((cell) => cell.classList.add("is-extra"));
    if (message) message.textContent = "There are too many. Take one away.";
    this.context.onSpeak("There are too many. Let's take one away.");
  }

  private placeAddStoryObject(round: ChoiceRound, card: HTMLElement, target: HTMLElement): void {
    const addCount = round.addCount ?? 0;
    const startCount = round.startCount ?? 0;
    if (this.placedCount >= addCount) {
      this.handleWrong(card);
      return;
    }

    this.placedCount += 1;
    card.dataset.placed = "true";
    card.classList.add("is-placed");
    card.style.visibility = "hidden";
    card.style.transform = "translate(0, 0)";

    const items = target.querySelector<HTMLElement>("[data-testid='story-mat-items']");
    if (items && round.objectImage) {
      items.append(this.makeSmallObjectImage(round.objectImage));
    }

    const totalSoFar = startCount + this.placedCount;
    const countLabel = target.querySelector<HTMLElement>("[data-testid='story-count-label']");
    if (countLabel) countLabel.replaceChildren(this.makeNumberCue(totalSoFar));
    this.context.onSpeak(String(totalSoFar));

    if (this.placedCount === addCount) {
      this.locked = true;
      target.classList.add("is-ready-to-answer");
      const equation = this.context.root.querySelector<HTMLElement>("[data-testid='add-equation']");
      if (equation) {
        equation.classList.remove("is-hidden");
        equation.textContent = `${startCount} + ${addCount} = ?`;
      }
      const answerPanel = this.context.root.querySelector<HTMLElement>("[data-testid='add-answer-panel']");
      answerPanel?.classList.remove("is-hidden");
      this.context.onSpeak("How many all together?");
    }
  }

  private chooseAddStoryAnswer(round: ChoiceRound, button: HTMLElement, choiceId: string): void {
    if (!this.locked || this.answerComplete) return;

    if (choiceId !== round.correctChoiceId) {
      button.classList.add("is-neutral-wrong");
      this.context.onNeutral();
      window.setTimeout(() => button.classList.remove("is-neutral-wrong"), 750);
      return;
    }

    const startCount = round.startCount ?? 0;
    const addCount = round.addCount ?? 0;
    const totalCount = round.totalCount ?? Number(round.correctChoiceId);
    button.classList.add("is-correct");
    this.answerComplete = true;
    const equation = this.context.root.querySelector<HTMLElement>("[data-testid='add-equation']");
    if (equation) equation.textContent = `${startCount} + ${addCount} = ${totalCount}`;
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(round.praise).then(() => this.advance());
  }

  private placeSubtractStoryObject(round: ChoiceRound, card: HTMLElement, target: HTMLElement): void {
    const removeCount = round.removeCount ?? 0;
    const startCount = round.startCount ?? 0;
    if (this.placedCount >= removeCount) {
      this.handleWrong(card);
      return;
    }

    this.placedCount += 1;
    card.dataset.placed = "true";
    card.classList.add("is-placed");
    card.style.visibility = "hidden";
    card.style.transform = "translate(0, 0)";

    const totalLeft = startCount - this.placedCount;
    const countLabel = this.context.root.querySelector<HTMLElement>("[data-testid='subtract-count-label']");
    if (countLabel) countLabel.replaceChildren(this.makeNumberCue(totalLeft));
    const takeAwayLabel = target.querySelector<HTMLElement>("[data-testid='take-away-count']");
    if (takeAwayLabel) takeAwayLabel.replaceChildren(this.makeNumberCue(this.placedCount));
    this.context.onSpeak(String(totalLeft));

    if (this.placedCount === removeCount) {
      this.locked = true;
      target.classList.add("is-ready-to-answer");
      const equation = this.context.root.querySelector<HTMLElement>("[data-testid='subtract-equation']");
      if (equation) {
        equation.classList.remove("is-hidden");
        equation.textContent = `${startCount} - ${removeCount} = ?`;
      }
      const answerPanel = this.context.root.querySelector<HTMLElement>("[data-testid='subtract-answer-panel']");
      answerPanel?.classList.remove("is-hidden");
      this.context.onSpeak("How many are left?");
    }
  }

  private chooseSubtractStoryAnswer(round: ChoiceRound, button: HTMLElement, choiceId: string): void {
    if (!this.locked || this.answerComplete) return;

    if (choiceId !== round.correctChoiceId) {
      button.classList.add("is-neutral-wrong");
      this.context.onNeutral();
      window.setTimeout(() => button.classList.remove("is-neutral-wrong"), 750);
      return;
    }

    const startCount = round.startCount ?? 0;
    const removeCount = round.removeCount ?? 0;
    const totalCount = round.totalCount ?? Number(round.correctChoiceId);
    button.classList.add("is-correct");
    this.answerComplete = true;
    const equation = this.context.root.querySelector<HTMLElement>("[data-testid='subtract-equation']");
    if (equation) equation.textContent = `${startCount} - ${removeCount} = ${totalCount}`;
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(round.praise).then(() => this.advance());
  }

  private handleCorrect(round: ChoiceRound, card: HTMLElement, bin: HTMLElement): void {
    this.locked = true;
    card.classList.add("is-correct");
    bin.classList.add("has-match");
    const word = round.item ? round.item.label.charAt(0).toUpperCase() + round.item.label.slice(1) : "";
    const spoken = round.item && round.rime ? `${round.praise} ${word}, ${round.rime}.` : round.praise;
    this.context.onRoundComplete(this.roundIndex);
    void this.context.onPraise(spoken).then(() => this.advance());
  }

  private handleWrong(card: HTMLElement): void {
    card.classList.add("is-neutral-wrong");
    card.style.transform = "translate(0, 0)";
    this.context.onNeutral();
    window.setTimeout(() => card.classList.remove("is-neutral-wrong"), 750);
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
    if (this.context.content.id === "make-a-set") {
      text.textContent = "You made all the sets.";
    } else if (this.context.content.id === "add-to-story-mat") {
      text.textContent = "You solved all the story mats.";
    } else if (this.context.content.id === "subtraction-story-mat") {
      text.textContent = "You solved all the take-away story mats.";
    } else if (this.context.content.id === "rhyme-house") {
      text.textContent = "You finished all the rhyme houses.";
    } else {
      text.textContent = "You finished all the rounds.";
    }
    const replay = this.button("Play Again", "primary-action");
    replay.addEventListener("click", () => this.mount());
    panel.append(title, text);
    this.appendCompletionNavigation(panel, replay);
    this.context.root.append(panel);
  }
}
