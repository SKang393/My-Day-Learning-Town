# SVG Replacement Current

Last updated: 2026-05-07

## Verification

- `npm run qa:no-svg`: PASS.
- Runtime SVG files: 0.
- SVG references: 0.
- Embedded SVG files: 0.

## Source Search Notes

- `.svg` and `SVG` source searches now return documentation rules, QA assertions, and emergency fallback audit text only.
- No active content JSON, registry entry, style image, or runtime image source points to an SVG file.

## Remaining SVG-Like PNG Concern

- The app still has legacy low-resolution PNGs that may visually resemble old placeholder art.
- These are tracked as image-quality blockers, not SVG blockers.
- Highest-priority follow-up areas: social studies role choices, school-place choices, some legacy literacy/CVC objects, and some science material object choices.
