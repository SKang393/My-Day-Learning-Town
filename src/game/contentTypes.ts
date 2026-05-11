export type CategoryId = "literacy" | "math" | "science" | "social-studies";
export type TemplateId = "choose-1-of-3" | "drag-match" | "drag-into-slots" | "drag-sequence" | "tracing" | "sort-bins";

export interface ChoiceOption {
  id: string;
  label: string;
  image?: string;
  count?: number;
}

export interface ModelStep {
  title: string;
  instruction: string;
  targetWord: string;
  targetImage?: string;
  sceneImage?: string;
  matchingImage?: string;
  matchingLabel: string;
  examples?: Array<{ label?: string; image?: string }>;
  arrowLabel?: string;
  explanation: string;
}

export interface RhymeBin {
  id: string;
  label: string;
  image?: string;
}

export interface DragItem {
  id: string;
  label: string;
  image?: string;
}

export interface LetterTile {
  id: string;
  label: string;
}

export interface SentencePart {
  id: string;
  label: string;
  image?: string;
}

export interface ChoiceRound {
  id: string;
  prompt: string;
  instruction: string;
  context: string;
  targetWord?: string;
  targetImage?: string;
  mode?: "same" | "not-same" | "long-vowel" | "context-clue" | "punctuation-pop" | "shape-hunt" | "equal-shares" | "measure" | "measure-objects" | "garden-helper" | "community-helper" | "school-map" | "help-community" | "material-sort" | "map-builder" | "water-earth" | "earn-money" | "save-goal" | "shape-sort" | "fast-slow" | "needs-wants" | "then-now" | "exact-match" | "vowel-choice" | "snack-tray" | "parking-lot" | "make-set" | "add-to-story" | "subtract-story" | "sentence-order" | "story-order" | "punctuation-choice" | "opinion-builder";
  options?: ChoiceOption[];
  correctChoiceId?: string;
  bins?: RhymeBin[];
  item?: DragItem;
  correctBinId?: string;
  rime?: string;
  targetCount?: number;
  startCount?: number;
  addCount?: number;
  removeCount?: number;
  totalCount?: number;
  objectName?: string;
  objectImage?: string;
  totalObjects?: number;
  targetAreaLabel?: string;
  storyMatLabel?: string;
  unitImage?: string;
  unitName?: string;
  measureCount?: number;
  answerPrompt?: string;
  word?: string;
  wordImage?: string;
  letters?: string[];
  sounds?: string[];
  tiles?: LetterTile[];
  sentence?: string;
  sentenceImage?: string;
  sentenceParts?: SentencePart[];
  correctSequence?: string[];
  slotLabels?: string[];
  punctuationChoices?: string[];
  correctPunctuation?: string;
  praise: string;
}

export interface GameContent {
  id: string;
  title: string;
  category: CategoryId;
  template: TemplateId;
  directions: string;
  environment: string;
  model?: ModelStep;
  rounds: ChoiceRound[];
}

export interface GameDefinition {
  id: string;
  title: string;
  category: CategoryId;
  template: TemplateId;
  description: string;
  status: "playable" | "placeholder" | "locked";
  /** Selection-screen thumbnail only. In-game prompt, choice, and model visuals must use content assets. */
  image?: string;
  content?: GameContent;
}

export interface CategoryDefinition {
  id: CategoryId;
  title: string;
  locked: boolean;
  image: string;
  description: string;
}

