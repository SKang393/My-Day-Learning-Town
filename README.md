# My Day Learning Town

This repository contains the clean source project for My Day Learning Town. The playable Windows build is distributed separately through GitHub Releases.

## Download

The playable Windows EXE is available through GitHub Releases.

Current version: `v0.7.0`

Download `My Day Learning Town.exe` from the Releases page:

```text
https://github.com/sungwoo651/My-Day-Learning-Town/releases
```

## Development

```powershell
npm install
npm run dev
```

Open the Vite local URL in Chrome for development. Do not open `index.html` directly with `file://`.

To check a production build:

```powershell
npm run build
```

## Audio

Kokoro local WAV audio is the primary student speech system. The current local voice target is Kokoro `af_heart`.

Browser/default speech is emergency fallback only when a local WAV is missing or cannot play. Microsoft, Google, OpenAI, and other cloud voices are not the normal classroom speech path.

Students replay directions by clicking the visible guiding sentence. There is no separate Repeat button in the current shell.

## Images

Runtime student-facing images must be PNG. New or replacement student-facing images must come from `/imagegen` and must be wired into runtime before they count as complete.

Do not create SVG placeholders. Do not use SVG icons, SVG backgrounds, SVG arrows, SVG game images, or SVG category images.

Current runtime image folders:

```text
public/assets/generated/current/
public/assets/rasterized/exact/
```

## Project Structure

```text
electron/                        Electron wrapper source
public/assets/audio/kokoro/      Local Kokoro WAV speech files
public/assets/generated/current/ Current generated PNG learning visuals
public/assets/rasterized/exact/  PNG versions of exact diagrams and symbols
src/content/                     JSON game content and audio manifest
src/game/                        Shared shell, templates, and systems
```
