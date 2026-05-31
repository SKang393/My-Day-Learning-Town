# My Day Learning Town

**Current version:** v0.9.0

My Day Learning Town is a browser-based educational mini-game collection for early literacy, math, science, and social studies practice. It is designed for touch-friendly classroom use with large choices, clear PNG visuals, local audio assets, and simple one-task screens.

## Download

The playable Windows releases are available through GitHub Releases:

https://github.com/sungwoo651/My-Day-Learning-Town/releases

Download one of the release assets for v0.7.0:

- `My-Day-Learning-Town-v0.7-Windows-EXE.zip`: Electron-wrapped Windows app.
- `My-Day-Learning-Town-v0.7-Windows-Browser.zip`: browser-launch version for school computers that block unsigned EXE apps.

Extract the full ZIP before running. Do not run the app from inside the compressed ZIP.

## Run From Source

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Build the source:

```powershell
npm run build
```

Run the Electron desktop shell during development:

```powershell
npm run desktop:dev
```

## Runtime Assets

Student-facing runtime images are PNG files. SVG files are not used as runtime game assets.

Local Kokoro WAV audio is the primary student speech path. Browser speech synthesis is only a fallback when a local WAV cannot play.

## Source Layout

```text
src/       game source and content JSON
public/    runtime PNG and WAV assets
electron/  Electron desktop shell
```

The repository intentionally excludes packaged runtime output, local QA reports, development utility scripts, dependency folders, and generated release folders.
