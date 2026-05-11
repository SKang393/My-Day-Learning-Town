interface LearningTownDisplayInfo {
  workArea: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scaleFactor?: number;
}

interface LearningTownWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LearningTownDesktopApi {
  getDisplayInfo(): Promise<LearningTownDisplayInfo>;
  getWindowBounds(): Promise<LearningTownWindowBounds>;
  setWindowSize(width: number, height: number): Promise<unknown>;
  setWindowBounds(bounds: LearningTownWindowBounds): Promise<unknown>;
}

interface Window {
  learningTownDesktop?: LearningTownDesktopApi;
}
