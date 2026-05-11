# Current QA Summary

Last updated: 2026-05-07

## Current Status

| Area | Status | Evidence |
| --- | --- | --- |
| No-SVG status | PASS | `npm run qa:no-svg`: 0 runtime SVG files, 0 SVG references, 0 embedded SVG files. |
| Start screen | PASS | Start screen stays on Terms of Service until Agree or Disagree. Disagree shows blocking message. |
| Game icons | PARTIAL | All 28 games have individualized thumbnails. `Water on Earth` thumbnail was replaced with `game-icon-water-on-earth-v2.png`. Older thumbnails were verified as active but not all regenerated in this pass. |
| Thumbnail separation | PASS | `src/content` has no `game-icon-` references. Registry thumbnails are selection-only. |
| Kokoro coverage | PASS | `npm run qa:audio`: 884 manifest lines, missing WAV count 0, empty WAV count 0. |
| Repeat behavior | PASS | Separate Repeat button removed. Clicking the guiding sentence replays the current sentence through `speak()`, which tries Kokoro WAV first. |
| Teaching-page blocking | PASS | Model Start button stays as Listen First until `onModelDirections` resolves or safe timeout unlocks. |
| Teaching-page visuals | PASS for known thumbnail reuse | 28 model pages use separate `teaching-*.png` images. |
| Screen QA | PASS | `npm run qa:screens`: 3 home screenshots, 4 area screenshots, 28 routes, 0 issues. |
| Packaging/folder | PASS | Root `My Day Learning Town.exe` exists, `release` removed, no nested `LFI Games`. |
| Image-quality status | PARTIAL | No active SVGs remain, but active inventory still includes 106 small legacy PNG references. Some are exact geometry assets, others need follow-up regeneration. |

## Remaining Blockers

- Active low-resolution legacy PNGs remain in some object, place, and role choices. They are PNGs, not SVGs, but not every active image has been regenerated with `/imagegen` in this pass.
- `IMAGE_GENERATION_LOG_CURRENT.md` includes exact prompts for images generated after the context transition. Exact prompts for the 28 teaching-scene images generated before compaction could not be recovered from local files, so the prompt audit for those entries is marked blocked.
