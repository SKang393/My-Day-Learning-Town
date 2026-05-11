# My Day Learning Town

The existing `LFI games` folder is the main project folder and the classroom folder.

## Download

The playable Windows EXE is available through GitHub Releases.

Current version: `v0.7.0`

Download `My Day Learning Town.exe` from the Releases page:

```text
https://github.com/sungwoo651/My-Day-Learning-Town/releases
```

## Run The Game

Double-click this file in the main `LFI games` folder:

```text
My Day Learning Town.exe
```

Do not use a nested `LFI Games` folder. Do not use `release/` as the classroom copy.

## Copy To Another Windows Computer

Copy the whole `LFI games` folder.

Do not copy only `My Day Learning Town.exe`. The EXE needs the nearby Electron support files, including `resources/`, `locales/`, DLL files, PNG assets, and Kokoro WAV audio files.

## Refresh The Desktop App

From the main `LFI games` folder:

```powershell
npm install
npm run desktop:package
```

The packaging script may create `release/` temporarily, but it must remove it after the root runtime is refreshed.

## Development Run

```powershell
npm install
npm run dev
```

Open the Vite local URL in Chrome for development only. Do not open `index.html` directly with `file://`.

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

## Current QA

Use this file as the current QA reference:

```text
CURRENT_QA_SUMMARY.md
```

Older recovery, remediation, packaging, image, audio, and screen reports were merged or removed. Do not rely on old package copies or stale reports.

## Project Structure

```text
My Day Learning Town.exe          Classroom start file
resources/                       Electron packaged app resources
locales/                         Electron language resources
electron/                        Electron wrapper source
public/assets/audio/kokoro/      Local Kokoro WAV speech files
public/assets/generated/current/ Current generated PNG learning visuals
public/assets/rasterized/exact/  PNG versions of exact diagrams and symbols
src/content/                     JSON game content and audio manifest
src/game/                        Shared shell, templates, and systems
scripts/make-windows-exe.ps1     Refreshes the Windows desktop package
```

## Quick QA Commands

```powershell
npm run qa:no-svg
npm run audio:extract
npm run audio:generate
npm run qa:audio
npm run build
npm run desktop:package
```
