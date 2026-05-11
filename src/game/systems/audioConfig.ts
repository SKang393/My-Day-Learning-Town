export type VoiceMode = "kokoro-local" | "browser-local";
export type PraiseWaitMode = "full" | "short" | "skip";

export interface AudioRuntimeConfig {
  defaultVoiceMode: VoiceMode;
  defaultPraiseWaitMode: PraiseWaitMode;
  kokoroVoiceName: string;
  kokoroVoiceDisplayName: string;
  speechRate: number;
  minSpeechRate: number;
  maxSpeechRate: number;
  praiseShortWaitMs: number;
  chimeVolume: number;
  voiceVolume: number;
  chimeAssetPath: string;
}

export const audioConfig: AudioRuntimeConfig = {
  defaultVoiceMode: "kokoro-local",
  defaultPraiseWaitMode: "full",
  kokoroVoiceName: "af_heart",
  kokoroVoiceDisplayName: "Kokoro af_heart local WAV",
  speechRate: 0.95,
  minSpeechRate: 0.75,
  maxSpeechRate: 1.15,
  praiseShortWaitMs: 850,
  chimeVolume: 1,
  voiceVolume: 0.9,
  chimeAssetPath: "/assets/audio/sfx/correct-chime.wav",
};
