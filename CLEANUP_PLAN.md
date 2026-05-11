# Cleanup Plan

Date: 2026-04-28

This file records the required pre-delete audit and the final cleanup status. There is no `.git` folder in this workspace, so no git rollback is available.

## 1. Top-Level Folder Tree

Final root-level folders:

```text
dist/
docs/
electron/
locales/
node_modules/
public/
resources/
scripts/
src/
```

Final root-level classroom start file:

```text
My Day Learning Town.exe
```

## 2. Source Folders

- `src/`: runtime TypeScript and JSON content.
- `public/assets/audio/`: Kokoro WAV and local chime assets.
- `public/assets/generated/current/`: current student-facing generated PNG visuals.
- `public/assets/rasterized/exact/`: PNG-only exact diagrams and symbols.
- `electron/`: Electron wrapper source.
- `scripts/`: active QA, audio, and packaging scripts.

## 3. Build Output Folders

- `dist/`: Vite browser build output.
- `resources/` and `locales/`: root-level Electron runtime support files copied from the packaged app.
- `node_modules/`: dependency install output.

## 4. Duplicate Package Folders

- `LFI Games/`: deleted after packaging verification.
- `release/`: deleted by `scripts/make-windows-exe.ps1` after root package copy.
- `.desktop-staging/`: deleted by `scripts/make-windows-exe.ps1`.

## 5. Safe-To-Delete Items

Deleted after reference checks:

- `public/assets/generated/full-replacement/`
- `public/assets/generated/individual/`
- `public/assets/generated/individual-review/`
- `public/assets/generated/learning-town/`
- `public/assets/generated/remediation/`
- `public/assets/generated/ui/`
- obsolete remediation generator scripts in `scripts/`
- stale root markdown, text, and log reports listed in `CURRENT_QA_SUMMARY.md`

## 6. Merge Before Deletion

Useful facts from old QA and recovery files were merged into:

- `CURRENT_QA_SUMMARY.md`
- `ASSET_AUDIT_CURRENT.md`
- `IMAGE_GENERATION_LOG_CURRENT.md`
- `AUDIO_QA_CURRENT.md`
- `SCREEN_QA_CURRENT.md`
- `PACKAGING_QA_CURRENT.md`
- `FINAL_TEACHING_PAGE_REVIEW.md`

## 7. Current Documentation To Keep

- `README.md`
- `AGENTS.md`
- `CLEANUP_PLAN.md`
- `CURRENT_QA_SUMMARY.md`
- `TASKS_CURRENT.md`
- `ASSET_AUDIT_CURRENT.md`
- `IMAGE_GENERATION_LOG_CURRENT.md`
- `AUDIO_QA_CURRENT.md`
- `SCREEN_QA_CURRENT.md`
- `PACKAGING_QA_CURRENT.md`
- `FINAL_TEACHING_PAGE_REVIEW.md`

## 8. Stale Files Deleted

- `ASSET_AUDIT_REPORT.md`
- `AUDIO_AND_SETTINGS_QA.md`
- `AUDIO_QA.md`
- `FINAL_PACKAGE_VERIFICATION.md`
- `FINAL_QA.md`
- `IMAGE_AUDIT_REPORT.md`
- `IMAGE_GENERATION_LOG.md`
- `PACKAGING_QA.md`
- `RECOVERY_STATUS.md`
- `SCREEN_QA_REPORT.md`
- `SVG_PURGE_REPORT.md`
- `TASKS_LFI_GAME_REMEDIATION.md`
- `TASKS_RECOVERY.md`
- `kokoro-generate.log`

## 9. Uncertain Items

- Some active images under `public/assets/generated/current/` still need later visual upgrade if the standard is every active object image must be newly generated in this pass. They are not stale folder references, but several are visually simple. See `ASSET_AUDIT_CURRENT.md`.
- The full Electron EXE was launched from the root and stayed running with child processes before it was closed. It was not classroom-playtested by a human user.

## 10. Kokoro State

- Manifest: `src/content/audio-manifest.json`
- Voice: `af_heart`
- Manifest lines: 878
- Kokoro WAV files: 878
- Missing WAV count: 0
- Empty WAV count: 0

## 11. Active Image Reference State

- Active source image refs under old generated folders: 0
- Active source image refs under `public/assets/generated/current/`: 161
- Active source image refs under `public/assets/rasterized/exact/`: 14
- Packaged generated folders after rebuild: `resources/app/dist/assets/generated/current/` only

## 12. Final Runnable App Location

```text
LFI games/My Day Learning Town.exe
```

Copy the whole `LFI games` folder to another Windows computer.
