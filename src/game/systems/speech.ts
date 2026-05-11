import audioManifest from "../../content/audio-manifest.json";
import { audioConfig } from "./audioConfig";
import { getSettings } from "./storage";

let lastSpoken = "";
let playbackToken = 0;
let activeAudio: HTMLAudioElement | undefined;

type AudioBackend = "kokoro-local" | "browser-local" | "none";
type KokoroPlayResult = "played" | "missing" | "failed";

export interface AudioDebugState {
  selectedVoiceMode: string;
  selectedVoiceName: string;
  actualBackend: AudioBackend;
  actualVoice: string;
  browserFallbackHappened: boolean;
  fallbackReason: string;
  lastPath: string;
  currentSource: string;
  speechRate: number;
}

interface AudioManifestItem {
  id: string;
  text: string;
  path: string;
}

const manifestItems = (audioManifest.items ?? []) as AudioManifestItem[];
const manifestByText = new Map(manifestItems.map((item) => [normalizeSpeakText(item.text), item]));

let lastAudioState: AudioDebugState = {
  selectedVoiceMode: audioConfig.defaultVoiceMode,
  selectedVoiceName: audioConfig.kokoroVoiceDisplayName,
  actualBackend: "kokoro-local",
  actualVoice: audioConfig.kokoroVoiceDisplayName,
  browserFallbackHappened: false,
  fallbackReason: manifestItems.length ? "" : "Kokoro audio manifest has no entries.",
  lastPath: "",
  currentSource: "Kokoro local WAV",
  speechRate: audioConfig.speechRate,
};

export function normalizeSpeakText(text: string): string {
  return String(text ?? "")
    .replace(/\s*\(progress:\s*\d+\s*\/\s*\d+\)\s*/gi, " ")
    .replace(/\bprogress:\s*\d+\s*\/\s*\d+\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nextToken(): number {
  playbackToken += 1;
  return playbackToken;
}

function stopActivePlayback(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = undefined;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function setAudioState(partial: Partial<AudioDebugState>): void {
  const settings = getSettings();
  lastAudioState = {
    ...lastAudioState,
    selectedVoiceMode: settings.voiceMode,
    selectedVoiceName: audioConfig.kokoroVoiceDisplayName,
    speechRate: settings.speechRate,
    ...partial,
  };
  window.dispatchEvent(new CustomEvent("learning-town-audio-state"));
}

export function getAudioDebugState(): AudioDebugState {
  return { ...lastAudioState };
}

export function syncAudioDebugSettings(): AudioDebugState {
  const localReady = manifestItems.length > 0;
  setAudioState({
    actualBackend: localReady ? "kokoro-local" : "none",
    actualVoice: localReady ? audioConfig.kokoroVoiceDisplayName : "Kokoro files missing",
    currentSource: localReady ? "Kokoro local WAV" : "Kokoro local WAV unavailable",
    fallbackReason: localReady ? "" : "Run Kokoro audio generation to create local WAV files.",
    browserFallbackHappened: false,
    lastPath: "",
  });
  return getAudioDebugState();
}

export function getAvailableSpeechVoices(): SpeechSynthesisVoice[] {
  if (!("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const localOrEnglish = voices.filter((voice) => voice.localService || voice.lang.toLowerCase().startsWith("en"));
  return localOrEnglish.length ? localOrEnglish : voices;
}

function voiceLabel(voice?: SpeechSynthesisVoice): string {
  return voice ? `${voice.name} (${voice.lang})` : "System default";
}

function chooseSpeechVoice(): SpeechSynthesisVoice | undefined {
  const settings = getSettings();
  const voices = getAvailableSpeechVoices();
  const requested = voices.find((voice) => voice.voiceURI === settings.browserVoiceURI);
  if (requested) return requested;
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const localEnglish = english.find((voice) => voice.localService);
  return localEnglish ?? english[0] ?? voices[0];
}

function speakWithBrowserFallback(text: string, reason: string, token: number, waitForEnd: boolean): Promise<void> {
  if (!("speechSynthesis" in window)) {
    setAudioState({
      actualBackend: "none",
      actualVoice: "unavailable",
      currentSource: "Kokoro local WAV unavailable",
      fallbackReason: reason,
      lastPath: "",
      browserFallbackHappened: false,
    });
    return Promise.resolve();
  }

  const settings = getSettings();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = chooseSpeechVoice();
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = settings.speechRate;
  utterance.volume = settings.voiceVolume;

  setAudioState({
    actualBackend: "browser-local",
    actualVoice: voiceLabel(selectedVoice),
    browserFallbackHappened: true,
    fallbackReason: reason,
    currentSource: "Emergency browser speech fallback",
    lastPath: "",
  });

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish();
      return;
    }
    if (!waitForEnd) {
      window.setTimeout(finish, 120);
      return;
    }
    window.setTimeout(finish, Math.max(2800, text.length * 180));
    if (token !== playbackToken) finish();
  });
}

function playKokoroWav(text: string, token: number, waitForEnd: boolean): Promise<KokoroPlayResult> {
  const item = manifestByText.get(text);
  if (!item) return Promise.resolve("missing");

  return new Promise((resolve) => {
    const audio = new Audio(item.path);
    activeAudio = audio;
    audio.preload = "auto";
    audio.volume = getSettings().voiceVolume;
    audio.playbackRate = getSettings().speechRate;

    let resolved = false;
    const resolveOnce = (result: KokoroPlayResult) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
    };
    const clearActiveAudio = () => {
      if (activeAudio === audio) activeAudio = undefined;
    };
    const finish = (result: KokoroPlayResult) => {
      clearActiveAudio();
      resolveOnce(result);
    };

    setAudioState({
      actualBackend: "kokoro-local",
      actualVoice: audioConfig.kokoroVoiceDisplayName,
      browserFallbackHappened: false,
      fallbackReason: "",
      currentSource: "Kokoro local WAV",
      lastPath: item.path,
    });

    const markStarted = () => {
      if (token !== playbackToken) {
        finish("failed");
        return;
      }
      if (!waitForEnd) resolveOnce("played");
    };

    audio.onplaying = markStarted;
    audio.onended = () => finish("played");
    audio.onerror = () => finish("failed");
    void audio
      .play()
      .then(markStarted)
      .catch(() => finish("failed"));

    window.setTimeout(() => {
      if (waitForEnd) {
        audio.pause();
        audio.src = "";
        finish("played");
        return;
      }
      if (!resolved && activeAudio === audio) resolveOnce("played");
    }, waitForEnd ? Math.max(3600, text.length * 190) : 1800);
  });
}

async function playLine(text: string, options: { force?: boolean; waitForEnd?: boolean } = {}): Promise<void> {
  const settings = getSettings();
  const normalized = normalizeSpeakText(text);
  if (!normalized) return;
  const token = nextToken();
  stopActivePlayback();
  lastSpoken = normalized;
  if (!options.force && !settings.audioEnabled) {
    setAudioState({ actualBackend: "none", actualVoice: "muted", currentSource: "muted", lastPath: "", fallbackReason: "" });
    return;
  }

  const kokoroResult = await playKokoroWav(normalized, token, options.waitForEnd ?? false);
  if (kokoroResult !== "played" && token === playbackToken) {
    const reason =
      kokoroResult === "missing"
        ? "No matching Kokoro WAV was found for this line."
        : "A matching Kokoro WAV was found but could not play.";
    await speakWithBrowserFallback(normalized, reason, token, options.waitForEnd ?? false);
  }
}

export function speak(text: string, force = false): void {
  void playLine(text, { force, waitForEnd: false });
}

export function speakAsync(text: string, force = false): Promise<void> {
  return playLine(text, { force, waitForEnd: true });
}

function playChimeFile(token: number): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(audioConfig.chimeAssetPath);
    audio.volume = getSettings().chimeVolume;
    let settled = false;
    const finish = (played: boolean) => {
      if (settled) return;
      settled = true;
      resolve(played);
    };
    audio.oncanplaythrough = () => {
      if (token !== playbackToken) {
        finish(false);
        return;
      }
      void audio.play().catch(() => finish(false));
    };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    window.setTimeout(() => finish(false), 900);
    audio.load();
  });
}

function playGeneratedChime(): Promise<void> {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return Promise.resolve();
  return new Promise((resolve) => {
    const audioContext = new AudioContextClass();
    const gain = audioContext.createGain();
    const volume = Math.max(0.001, getSettings().chimeVolume);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.46);
    gain.connect(audioContext.destination);

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.075);
      oscillator.connect(gain);
      oscillator.start(audioContext.currentTime + index * 0.075);
      oscillator.stop(audioContext.currentTime + 0.35 + index * 0.06);
    });

    window.setTimeout(() => {
      void audioContext.close();
      resolve();
    }, 560);
  });
}

function praiseMinimumWaitMs(text: string): number {
  return Math.min(7000, Math.max(2400, text.length * 135));
}

export async function playPraiseChime(force = false): Promise<void> {
  if (!force && !getSettings().audioEnabled) return;
  const token = playbackToken;
  const filePlayed = await playChimeFile(token);
  if (!filePlayed && token === playbackToken) await playGeneratedChime();
}

export async function praiseWithChime(text: string): Promise<void> {
  const settings = getSettings();
  const token = nextToken();
  stopActivePlayback();
  await playPraiseChime();
  if (token !== playbackToken) return;
  if (settings.praiseWaitMode === "skip") return;
  const praisePromise = playLine(text, { waitForEnd: true });
  if (settings.praiseWaitMode === "short") {
    await Promise.race([praisePromise, new Promise((resolve) => window.setTimeout(resolve, audioConfig.praiseShortWaitMs))]);
    return;
  }
  await Promise.all([praisePromise, new Promise((resolve) => window.setTimeout(resolve, praiseMinimumWaitMs(text)))]);
}
