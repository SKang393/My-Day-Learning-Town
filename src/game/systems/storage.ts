import type { GameContent } from "../contentTypes";
import { audioConfig, type PraiseWaitMode, type VoiceMode } from "./audioConfig";

export interface StoredProgress {
  completedRounds: Record<string, number>;
  lastGameId?: string;
}

export interface StoredSettings {
  audioEnabled: boolean;
  voiceMode: VoiceMode;
  browserVoiceURI: string;
  praiseWaitMode: PraiseWaitMode;
  chimeVolume: number;
  voiceVolume: number;
  speechRate: number;
}

const progressKey = "my-day-learning-town:progress";
const settingsKey = "my-day-learning-town:settings";

const defaultProgress: StoredProgress = { completedRounds: {} };
const defaultSettings: StoredSettings = {
  audioEnabled: true,
  voiceMode: audioConfig.defaultVoiceMode,
  browserVoiceURI: "",
  praiseWaitMode: audioConfig.defaultPraiseWaitMode,
  chimeVolume: audioConfig.chimeVolume,
  voiceVolume: audioConfig.voiceVolume,
  speechRate: audioConfig.speechRate,
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    const base = cloneJson(fallback);
    return raw ? ({ ...base, ...JSON.parse(raw) } as T) : base;
  } catch {
    return cloneJson(fallback);
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function getProgress(): StoredProgress {
  return readJson(progressKey, defaultProgress);
}

export function saveRoundProgress(content: GameContent, roundIndex: number): StoredProgress {
  const progress = getProgress();
  progress.completedRounds[content.id] = Math.max(progress.completedRounds[content.id] ?? 0, roundIndex + 1);
  progress.lastGameId = content.id;
  writeJson(progressKey, progress);
  return progress;
}

export function getSettings(): StoredSettings {
  const stored = readJson(settingsKey, defaultSettings) as StoredSettings & Record<string, unknown>;
  const praiseWaitMode = ["full", "short", "skip"].includes(String(stored.praiseWaitMode)) ? stored.praiseWaitMode : audioConfig.defaultPraiseWaitMode;
  const storedChimeVolume = Number(stored.chimeVolume);
  const chimeVolume = Number.isFinite(storedChimeVolume) && storedChimeVolume >= 0.5 ? storedChimeVolume : audioConfig.chimeVolume;
  const storedSpeechRate = Number(stored.speechRate);
  const speechRate = Number.isFinite(storedSpeechRate) && storedSpeechRate !== 0.82 ? storedSpeechRate : audioConfig.speechRate;
  const voiceMode = stored.voiceMode === "browser-local" ? "browser-local" : audioConfig.defaultVoiceMode;
  return {
    audioEnabled: stored.audioEnabled !== false,
    voiceMode,
    browserVoiceURI: typeof stored.browserVoiceURI === "string" ? stored.browserVoiceURI : "",
    praiseWaitMode,
    chimeVolume: clamp(chimeVolume, 0, 1, audioConfig.chimeVolume),
    voiceVolume: clamp(stored.voiceVolume, 0, 1, audioConfig.voiceVolume),
    speechRate: clamp(speechRate, audioConfig.minSpeechRate, audioConfig.maxSpeechRate, audioConfig.speechRate),
  };
}

export function saveSettings(settings: Partial<StoredSettings>): StoredSettings {
  const nextSettings = { ...getSettings(), ...settings };
  writeJson(settingsKey, nextSettings);
  return nextSettings;
}

export function resetSettings(): StoredSettings {
  writeJson(settingsKey, defaultSettings);
  return defaultSettings;
}

export function resetProgress(): StoredProgress {
  const nextProgress = cloneJson(defaultProgress);
  writeJson(progressKey, nextProgress);
  return nextProgress;
}

