# Audio QA Current

Last updated: 2026-05-07

## Commands Run

- `npm run audio:extract`: PASS, 884 spoken lines extracted.
- `npm run audio:generate`: PASS, 884 active lines covered.
- `npm run qa:audio`: PASS.

## Kokoro Status

- Primary voice: Kokoro `af_heart` local WAV.
- Manifest: `src/content/audio-manifest.json`.
- WAV folder: `public/assets/audio/kokoro/`.
- Active manifest line count: 884.
- Kokoro WAV count: 885, includes one unreferenced extra WAV from a corrected long-A mojibake line.
- Missing WAV count: 0.
- Empty WAV count: 0.

## Pages Fixed From Default TTS Risk

- Terms of Service Disagree message was added to extraction and generated as a Kokoro WAV.
- Literacy, Math, Science, and Social Studies area-page lines are included in the manifest.

## Guiding-Sentence Replay

- Separate Repeat button behavior was removed from the shell.
- `src/game/ui/AppShell.ts` makes the instruction panel clickable and keyboard-operable.
- Clicking the guiding sentence calls `speak(this.directions)`, which stops current playback first and then attempts the Kokoro manifest WAV.

## Overlap Prevention

- `src/game/systems/speech.ts` stops active WAV playback and cancels `speechSynthesis` before each new line.
- `praiseWithChime()` advances the playback token before praise and prevents stale audio from continuing.
- Teaching/model audio uses `speakAsync()` and blocks Start Game until the sentence finishes or the safe timeout unlocks.

## Fallback Status

- `speechSynthesis` remains only as emergency fallback for missing or failed Kokoro WAV playback.
- Current QA found no missing or empty active WAVs, so normal classroom lines should use Kokoro WAV.
