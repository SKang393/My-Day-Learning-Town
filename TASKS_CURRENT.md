# Tasks Current

Last updated: 2026-05-07

## 1. Remaining SVG And SVG-Like Visual Replacement

- Status: PARTIAL.
- Verified: `npm run qa:no-svg` reports 0 runtime SVG files, 0 SVG references, and 0 embedded SVG files.
- Remaining blocker: active runtime inventory still includes 106 PNG references under 20 KB. Some are exact math/shape diagrams, but several are legacy low-resolution object or role images that still need image-quality triage and replacement.

## 2. Thumbnail And In-Game Asset Separation

- Status: COMPLETE for known thumbnail reuse.
- Verified: `rg -n "game-icon-" src/content` returns no content JSON matches.
- Registry thumbnails remain only in `src/game/registry.ts` for selection screens.

## 3. Mini-Game Thumbnail Redesign

- Status: PARTIAL.
- Verified: all 28 games have individualized `game-icon-*.png` selection thumbnails.
- Replaced this pass: `game-icon-water-on-earth-v2.png` to remove the misleading Lake category label from the thumbnail.
- Remaining blocker: several older thumbnails were generated in a previous pass and were not regenerated in this pass.

## 4. Mini-Game Selection Paging

- Status: COMPLETE.
- Implemented: 6 games per page, swipe left/right paging, bottom page indicator dots, no visible duplicate text labels on game tiles.
- Verified: `npm run qa:screens` reports 4 category pages, 28 game routes, 0 issues.

## 5. Start Screen And Terms Flow

- Status: COMPLETE.
- Implemented: start screen stays visible, Agree enters the app, Disagree shows the neutral explanation and blocks gameplay.
- Verified: current screenshot contact sheet includes `splash-terms-1920x1080`, `splash-terms-1280x720`, and `splash-terms-1100x700`.

## 6. Literacy And Math Kokoro Coverage

- Status: COMPLETE.
- Verified: `npm run qa:audio` reports 884 active lines, missing WAV count 0, empty WAV count 0.
- Area-page lines are included in `src/content/audio-manifest.json`.

## 7. Repeat-By-Sentence Audio

- Status: COMPLETE.
- Implemented: separate Repeat button removed. The guiding sentence panel is clickable and replays the current line.
- Verified: `npm run qa:current` reports no `repeat-button-still-visible` issue.

## 8. Full Audio Manifest And WAV Regeneration

- Status: COMPLETE.
- Commands run: `npm run audio:extract`, `npm run audio:generate`, `npm run qa:audio`.
- Result: generated the Terms of Service blocking line WAV and restored missing coverage to 0.

## 9. Teaching-Page Redesign

- Status: COMPLETE for model-image thumbnail separation.
- Implemented: 28 first teaching/model pages now use separate `teaching-*.png` scene assets instead of mini-game thumbnails.
- Verified: `npm run qa:screens` found no `thumbnail-used-inside-game` issues.

## 10. Prompt-Answer Image Pairing Fixes

- Status: PARTIAL.
- Fixed: thumbnail reuse in science/social studies prompt images, Water on Earth liquid/solid answer images, Help Our Community floor-trash prompt.
- Remaining blocker: legacy low-resolution object and role answer images remain in some games and require a follow-up image-generation wave.

## 11. Final Runtime Verification

- Status: COMPLETE with documented visual blockers.
- Passed: `qa:no-svg`, `qa:audio`, `qa:current`, `qa:screens`, `build`, `desktop:package`.
- Root EXE launch check: process started from `My Day Learning Town.exe` and stayed alive after 6 seconds.

## 12. Final Folder And Package Verification

- Status: COMPLETE.
- Verified: no nested `LFI Games` folder, no `release` folder after packaging, root-level classroom EXE visible.
