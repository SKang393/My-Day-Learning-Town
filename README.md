# My Day Learning Town

**Current version:** v0.9.0

My Day Learning Town is a browser-based educational mini-game collection for early literacy, math, science, and social studies practice. It is designed for touch-friendly classroom use with large choices, clear PNG visuals, local audio assets, and simple one-task screens.

## Download

The playable Windows releases are available through GitHub Releases:

https://github.com/skang393/My-Day-Learning-Town/releases

Download one of the release assets for v0.9.0:

- `My-Day-Learning-Town-v0.9.0-Windows-EXE.zip`
  - Electron-wrapped Windows app.
  - Use this when the computer allows local unsigned Windows apps.

- `My-Day-Learning-Town-v0.9.0-Windows-Browser.zip`
  - Browser-launch version for school computers that block or discourage unsigned EXE apps.
  - Open `Open My Day Learning Town.html`.

Extract the full ZIP before running. Do not run the app from inside the compressed ZIP.

## Notes For Windows Users

The EXE version may show a Windows SmartScreen or "unrecognized app" warning on some computers. That warning is controlled by Windows code signing and app reputation. It cannot be removed by the game code alone.

If the EXE does not open on a school computer, use the Browser version instead.

## v0.9.0 Update Plan

The v0.9.0 release focuses on clean classroom delivery:

- Keep both Windows release options available: EXE and Browser.
- Use the Browser version on school computers that block unsigned EXE apps.
- Keep runtime student-facing images as PNG files.
- Keep local Kokoro WAV audio as the primary speech path.
- Continue keeping packaged runtime output, QA reports, scripts, and local process files out of the public source repository.

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
