# Asset Audit Current

Last updated: 2026-05-07

## Active Runtime Sources Audited

- `src/content/**/*.json`
- `src/game/registry.ts`
- `src/game/templates`
- `src/game/ui`
- `src/styles.css`

## SVG Status

- Runtime SVG files: 0.
- Active `.svg` references: 0.
- Embedded SVG markers in runtime assets: 0.
- Verification command: `npm run qa:no-svg`, PASS.

## Thumbnail Separation

- Selection thumbnails remain in `src/game/registry.ts` only.
- Content JSON no longer references `game-icon-*` assets.
- `rg -n "game-icon-" src/content` returns no matches.

## Runtime References Replaced

- 28 `model.sceneImage` paths replaced with separate `teaching-*.png` scene images.
- 55 gameplay `targetImage` thumbnail references replaced in science and social studies content.
- `water-on-earth` answer-choice images replaced with generated liquid-water and solid-ice PNGs.
- `src/game/registry.ts` now uses `game-icon-water-on-earth-v2.png`.

## Remaining Visual Audit Blocker

- Active runtime inventory contains 222 PNG references.
- 106 active PNG references are smaller than 20 KB. Some are intentionally exact math/shape diagrams, but several look like legacy low-resolution object or role art.
- These remaining images are not SVG files, but not all satisfy the current `/imagegen` quality target.
