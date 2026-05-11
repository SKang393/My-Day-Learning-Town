const fittedSelector = "[data-fit-text='true']";
const fittedContainerSelector = ".hub-tile, .game-tile, .choice-button, .control-button, .instruction-panel, .feedback-panel";

function numberAttr(element: HTMLElement, name: string, fallback: number): number {
  const raw = element.dataset[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function availableHeight(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const paddingY = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  return Math.max(0, element.clientHeight - paddingY);
}

function availableWidth(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const paddingX = Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
  return Math.max(0, element.clientWidth - paddingX);
}

function fits(element: HTMLElement): boolean {
  const height = availableHeight(element);
  const width = availableWidth(element);
  return element.scrollHeight <= height + 1 && element.scrollWidth <= width + 1;
}

export function fitTextElement(element: HTMLElement): void {
  if (!element.isConnected || element.clientWidth <= 0 || element.clientHeight <= 0) return;

  element.style.fontSize = "";
  const computed = window.getComputedStyle(element);
  const computedSize = Number.parseFloat(computed.fontSize);
  const max = numberAttr(element, "fitMax", Number.isFinite(computedSize) ? computedSize : 32);
  const min = numberAttr(element, "fitMin", 16);

  let low = min;
  let high = max;
  let best = min;

  for (let step = 0; step < 8; step += 1) {
    const mid = (low + high) / 2;
    element.style.fontSize = `${mid}px`;
    if (fits(element)) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  element.style.fontSize = `${Math.max(min, Math.floor(best))}px`;
}

function containerFits(container: HTMLElement): boolean {
  return container.scrollHeight <= container.clientHeight + 1 && container.scrollWidth <= container.clientWidth + 1;
}

function shrinkContainerText(container: HTMLElement): void {
  if (!container.isConnected || container.clientWidth <= 0 || container.clientHeight <= 0 || containerFits(container)) return;

  const children = Array.from(container.querySelectorAll<HTMLElement>(fittedSelector));
  const targets = children.length > 0 ? children : (container.matches(fittedSelector) ? [container] : []);
  if (targets.length === 0) return;

  for (let step = 0; step < 12 && !containerFits(container); step += 1) {
    let changed = false;
    targets.forEach((element) => {
      const min = numberAttr(element, "fitMin", 16);
      const current = Number.parseFloat(window.getComputedStyle(element).fontSize);
      if (!Number.isFinite(current) || current <= min) return;
      element.style.fontSize = `${Math.max(min, current - 1)}px`;
      changed = true;
    });
    if (!changed) break;
  }
}

export function fitTextTree(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(fittedSelector).forEach(fitTextElement);
  root.querySelectorAll<HTMLElement>(fittedContainerSelector).forEach(shrinkContainerText);
}

export function observeFittedText(root: ParentNode, onRefit: () => void): ResizeObserver | undefined {
  if (!("ResizeObserver" in window)) return undefined;
  const observer = new ResizeObserver(onRefit);
  root.querySelectorAll<HTMLElement>(fittedSelector).forEach((element) => observer.observe(element));
  return observer;
}
