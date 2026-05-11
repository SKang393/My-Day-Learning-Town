# Screen QA Current

Last updated: 2026-05-07

## Commands Run

- `npm run qa:current`: PASS, 0 issues.
- `npm run qa:screens`: PASS, 0 issues.

## Screenshot Evidence

Current screenshots are in:

- `docs/qa-screenshots/`

Current contact sheets:

- `docs/qa-screenshots/current-screen-contact-sheet.png`
- `docs/qa-screenshots/new-assets-contact-sheet.png`

## Screens Checked

- Start screen with Terms of Service at 1920x1080, 1280x720, 1100x700.
- Home/category selection at 1920x1080, 1280x720, 1100x700.
- All 4 category game-selection screens.
- All 28 first teaching/model pages.
- Representative gameplay screen for each of the 28 mini-games.

## UX Checks

- Start screen does not auto-advance.
- Agree enters the learning area.
- Disagree blocks gameplay and shows the neutral explanation.
- Game selection shows 6 games per page.
- Literacy and Math show bottom page dots.
- No visible duplicate text labels outside game thumbnails.
- No separate Repeat button visible.
- No model/game screen uses `game-icon-*` as an in-game image.

## Visual Inspection Notes

- New teaching scenes are large and clear in the contact sheet.
- Water on Earth gameplay now uses concrete water and ice assets.
- Remaining low-resolution legacy PNGs are documented in `ASSET_AUDIT_CURRENT.md` and `MINIGAME_CONTENT_REVIEW.txt`.
