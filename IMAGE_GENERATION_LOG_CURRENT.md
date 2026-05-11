# Image Generation Log Current

Last updated: 2026-05-07

## Summary

- New `/imagegen` PNGs generated and wired in this pass: 43.
- Exact prompt text is available in this log for the 13 images generated after the context transition.
- Exact prompt text for 30 images generated before the context transition is BLOCKED because the local generated PNG files do not preserve prompt text and the compacted context did not include every exact prompt. Their output paths and runtime wiring were verified.

## Exact Prompt Entries Available

| Item | Output PNG | Type | Intended runtime use | Runtime file | Verification |
| --- | --- | --- | --- | --- | --- |
| Garden butterfly and flower prompt | `public/assets/generated/current/ingame-garden-butterfly-flower.png` | Rectangular | Garden Helper prompt image | `src/content/science/school-garden-helper.json` | Wired and shown in asset contact sheet |
| Garden flower object | `public/assets/generated/current/ingame-garden-flower-card.png` | Transparent object | Garden Helper target image | `src/content/science/school-garden-helper.json` | Chroma-key alpha generated and wired |
| Garden seed object | `public/assets/generated/current/ingame-garden-seed-card.png` | Transparent object | Garden Helper target image | `src/content/science/school-garden-helper.json` | Chroma-key alpha generated and wired |
| Empty cup object | `public/assets/generated/current/ingame-garden-empty-cup-card.png` | Transparent object | Garden Helper target image | `src/content/science/school-garden-helper.json` | Chroma-key alpha generated and wired |
| Fish object | `public/assets/generated/current/ingame-garden-fish-card.png` | Transparent object | Garden Helper target image | `src/content/science/school-garden-helper.json` | Chroma-key alpha generated and wired |
| Soil object | `public/assets/generated/current/ingame-garden-soil-card.png` | Transparent object | Garden Helper target image | `src/content/science/school-garden-helper.json` | Chroma-key alpha generated and wired |
| Water liquid/solid prompt | `public/assets/generated/current/ingame-water-examples-scene.png` | Rectangular | Water on Earth prompt/model support | `src/content/science/water-on-earth.json` | Wired and shown in screenshots |
| Help Community floor trash | `public/assets/generated/current/ingame-help-community-trash-floor.png` | Rectangular | Help Our Community prompt image | `src/content/social-studies/help-our-community.json` | Wired and shown in content review |
| School map board | `public/assets/generated/current/ingame-school-map-board.png` | Rectangular | My School Map prompt image | `src/content/social-studies/my-school-map.json` | Wired and shown in screenshots |
| Then and Now sorting table | `public/assets/generated/current/ingame-then-now-sort-table.png` | Rectangular | Then and Now prompt image | `src/content/social-studies/then-and-now.json` | Wired and shown in screenshots |
| Water on Earth thumbnail v2 | `public/assets/generated/current/game-icon-water-on-earth-v2.png` | Rectangular thumbnail | Selection thumbnail | `src/game/registry.ts` | Wired in registry |
| Liquid water answer | `public/assets/generated/current/answer-water-liquid-cup.png` | Transparent object | Water on Earth answer and target image | `src/content/science/water-on-earth.json` | Chroma-key alpha generated and wired |
| Solid ice answer | `public/assets/generated/current/answer-water-solid-ice.png` | Transparent object | Water on Earth answer and target image | `src/content/science/water-on-earth.json` | Chroma-key alpha generated and wired |

### Exact Prompt Text

- `ingame-garden-butterfly-flower.png`: `/imagegen Use case: scientific-educational; Asset type: in-game prompt scene PNG for a young-student garden helper mini-game; Primary request: Create a clear child-friendly classroom garden scene showing one butterfly sitting near or on a bright flower, so the prompt means 'butterfly and flower'. Scene/backdrop: simple school garden planter with one large flower and one butterfly. Style/medium: polished educational illustration, concrete and readable, not abstract, not SVG-like, not icon-only. Composition/framing: rectangular scene, centered, flower and butterfly fill most of the frame, minimal background detail. Constraints: no labels, no text, no arrows, no extra animals, no extra hands or body parts, no watermark, no white border.`
- `ingame-garden-flower-card.png`: `/imagegen Use case: scientific-educational; Asset type: transparent in-game object PNG for a garden helper mini-game; Primary request: Create one large bright classroom-garden flower, easy for a young student to identify. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one flower only, stem and leaves visible. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no pot, no extra flowers, no hands, no shadow, no border, no watermark, do not use #00ff00 in the flower.`
- `ingame-garden-seed-card.png`: `/imagegen Use case: scientific-educational; Asset type: transparent in-game object PNG for a garden helper mini-game; Primary request: Create one large seed that a young student can recognize for planting. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one simple tan/brown garden seed only. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no packet, no soil, no sprout, no hands, no shadow, no border, no watermark, do not use #00ff00 in the seed.`
- `ingame-garden-empty-cup-card.png`: `/imagegen Use case: scientific-educational; Asset type: transparent in-game object PNG for a garden helper mini-game; Primary request: Create one empty cup or small mug, clearly empty, for a young student to identify. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one clean empty cup, open top visible, no liquid inside. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no water, no steam, no hands, no shadow, no border, no watermark, do not use #00ff00 in the cup.`
- `ingame-garden-fish-card.png`: `/imagegen Use case: scientific-educational; Asset type: transparent in-game object PNG for a garden helper mini-game; Primary request: Create one friendly fish, clearly a fish, easy for a young student to identify. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one fish only, side view, fins and tail visible. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no pond, no bowl, no water background, no bubbles, no hands, no shadow, no border, no watermark, do not use #00ff00 in the fish.`
- `ingame-garden-soil-card.png`: `/imagegen Use case: scientific-educational; Asset type: transparent in-game object PNG for a garden helper mini-game; Primary request: Create a clear mound of garden soil or dirt, easy for a young student to identify. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one small pile of dark brown soil only, with simple natural texture. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no plant, no seed, no shovel, no hands, no shadow, no border, no watermark, do not use #00ff00 in the soil.`
- `ingame-water-examples-scene.png`: `/imagegen Use case: scientific-educational; Asset type: in-game prompt scene PNG for Water on Earth mini-game; Primary request: Create a clear two-example scene showing liquid water pouring from a cup and solid water as stacked ice cubes, for sorting liquid vs solid. Scene/backdrop: simple classroom science table, no other categories. Style/medium: polished educational illustration, concrete and readable, not abstract, not SVG-like. Composition/framing: rectangular scene, two clear areas, liquid water on one side and ice cubes on the other, both large and centered. Constraints: no lake category, no gas, no steam, no extra category labels, no arrows, no watermark, no white border.`
- `ingame-help-community-trash-floor.png`: `/imagegen Use case: scientific-educational; Asset type: in-game prompt scene PNG for Help Our Community mini-game; Primary request: Create a simple classroom scene showing paper trash on the floor as a clear problem that needs help. Scene/backdrop: classroom floor near desks, with a few pieces of paper trash visible. Style/medium: polished educational illustration, concrete and readable for young students, not abstract, not SVG-like. Composition/framing: rectangular scene, trash is large and easy to see, uncluttered background. Constraints: no people, no hands, no labels, no arrows, no extra category examples, no watermark, no white border.`
- `ingame-school-map-board.png`: `/imagegen Use case: scientific-educational; Asset type: in-game prompt scene PNG for My School Map mini-game; Primary request: Create a clear school map board showing classroom, office, cafeteria, library, bathroom, and playground as distinct places for young students to identify. Scene/backdrop: simple school hallway bulletin board with a large map poster. Style/medium: polished educational illustration, concrete and readable, not abstract, not SVG-like. Composition/framing: rectangular scene, map board fills most of the frame, place icons are large and distinct. Text: optional short place labels only if clear and correctly spelled: Classroom, Office, Cafeteria, Library, Bathroom, Playground. Constraints: no tiny clutter, no arrows, no 'next' text, no watermark, no white border.`
- `ingame-then-now-sort-table.png`: `/imagegen Use case: scientific-educational; Asset type: in-game prompt scene PNG for Then and Now mini-game; Primary request: Create a clear sorting table scene with a friendly grandpa symbol for THEN and a child symbol for NOW, plus old/new object examples such as old phone vs smartphone and candle vs light bulb. Scene/backdrop: simple classroom table with two sorting mats. Style/medium: polished educational illustration, concrete and readable for young students, not abstract, not SVG-like. Composition/framing: rectangular scene, two large sorting areas, old objects on one side and new objects on the other. Text: optional labels only if clear and correctly spelled: Then, Now. Constraints: no arrows, no 'next' text, no extra categories, no distorted hands or faces, no watermark, no white border.`
- `game-icon-water-on-earth-v2.png`: `/imagegen Use case: scientific-educational; Asset type: mini-game selection thumbnail PNG; Primary request: Create a polished child-friendly thumbnail for the mini-game titled Water on Earth, showing only liquid water and solid ice as the visual concept. Scene/backdrop: simple science table with pouring water in a clear cup on one side and stacked ice cubes on the other. Style/medium: polished educational game thumbnail, concrete, readable, not abstract, not SVG-like. Composition/framing: square rounded-thumbnail composition, title text at top, objects large and clear. Text (verbatim): "Water on Earth". Constraints: do not include the word Lake, do not show lake as a category button, no gas, no steam, no extra categories, no arrows, no watermark.`
- `answer-water-liquid-cup.png`: `/imagegen Use case: scientific-educational; Asset type: transparent answer-choice PNG for Water on Earth mini-game; Primary request: Create a clear cup of liquid water, easy for a young student to identify as liquid water. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: one clear cup with blue liquid water inside, open top visible. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no ice, no steam, no hands, no shadow, no border, no watermark, do not use #00ff00 in the cup or water.`
- `answer-water-solid-ice.png`: `/imagegen Use case: scientific-educational; Asset type: transparent answer-choice PNG for Water on Earth mini-game; Primary request: Create stacked ice cubes, easy for a young student to identify as solid water. Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for background removal. Subject: three or four clear blue ice cubes stacked together, no puddle. Style/medium: polished educational object illustration, concrete, realistic enough to recognize, not abstract, not SVG-like. Composition/framing: centered object, fills most of the square image, clean crisp edges, generous padding. Constraints: no label, no text, no cup, no snow, no steam, no hands, no shadow, no border, no watermark, do not use #00ff00 in the ice.`

## Prompt Audit Blocked Entries

The following files were generated with `/imagegen`, copied into `public/assets/generated/current`, wired into runtime, and verified by screenshots/contact sheets, but exact prompts are not locally recoverable after context compaction:

- `teaching-same-sound-first-sound.png`
- `teaching-rhyme-house-at.png`
- `teaching-cvc-build-cat.png`
- `teaching-sight-word-my.png`
- `teaching-fix-sentence-order.png`
- `teaching-opinion-builder.png`
- `teaching-long-a-patterns.png`
- `teaching-story-order-first-next-last.png`
- `teaching-punctuation-ending-marks.png`
- `teaching-context-clue-sun.png`
- `teaching-number-parking-dots-5.png`
- `teaching-shape-sort-flat-solid.png`
- `teaching-shape-hunt-circle-sphere.png`
- `teaching-equal-shares.png`
- `teaching-measure-classroom-book.png`
- `teaching-make-set-five.png`
- `teaching-add-one-more-apple.png`
- `teaching-subtract-one-apple.png`
- `teaching-material-sort-properties.png`
- `teaching-garden-helper-plant-needs.png`
- `teaching-land-water-sort.png`
- `teaching-water-liquid-solid.png`
- `teaching-community-helper-problem-helper.png`
- `teaching-school-map-places.png`
- `teaching-earn-money-work-pay.png`
- `teaching-save-goal-truck-8.png`
- `teaching-help-community-action.png`
- `teaching-then-now-sort.png`
- `ingame-land-water-sort-map.png`
- `ingame-material-sort-table.png`

## Verification

- New PNGs were copied into `public/assets/generated/current/`.
- New images were wired into `src/content/**/*.json`, `src/game/registry.ts`, or `src/styles.css`.
- `npm run qa:no-svg`: PASS.
- `npm run qa:screens`: PASS, 28 routes, 0 issues.
