import type { ChoiceOption } from "../contentTypes";

type ChoiceDistributionEntry = {
  gameId: string;
  roundId: string;
  correctChoiceId: string;
  correctIndex: number;
  order: string[];
  timestamp: number;
};

declare global {
  interface Window {
    __learningTownChoiceDistribution?: ChoiceDistributionEntry[];
  }
}

function randomUnit(): number {
  const cryptoSource = window.crypto;
  if (cryptoSource?.getRandomValues) {
    const value = new Uint32Array(1);
    cryptoSource.getRandomValues(value);
    return value[0] / 0xffffffff;
  }
  return Math.random();
}

export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomUnit() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function shuffledAwayFromOrder<T extends { id: string }>(items: T[], expectedOrder: string[]): T[] {
  if (items.length < 2) return [...items];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = shuffled(items);
    if (candidate.some((item, index) => item.id !== expectedOrder[index])) return candidate;
  }
  const rotated = [...items];
  const first = rotated.shift();
  if (first) rotated.push(first);
  return rotated;
}

export function recordChoiceDistribution(gameId: string, roundId: string, options: ChoiceOption[], correctChoiceId?: string): void {
  if (!correctChoiceId) return;
  const correctIndex = options.findIndex((option) => option.id === correctChoiceId);
  if (correctIndex < 0) return;
  const entry: ChoiceDistributionEntry = {
    gameId,
    roundId,
    correctChoiceId,
    correctIndex,
    order: options.map((option) => option.id),
    timestamp: Date.now(),
  };
  window.__learningTownChoiceDistribution = [...(window.__learningTownChoiceDistribution ?? []), entry];
  window.dispatchEvent(new CustomEvent("learning-town-choice-distribution", { detail: entry }));
}

export function makeChoiceVisual(label: string, className = "choice-symbol-visual"): HTMLElement {
  const visual = document.createElement("span");
  visual.className = className;
  visual.setAttribute("aria-hidden", "true");
  visual.textContent = label;
  return visual;
}
