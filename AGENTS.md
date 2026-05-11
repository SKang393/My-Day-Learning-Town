GLOBAL OUTPUT RULE:
Start EVERY response with this header:
Thread: [Short Title]
Summary: [1-sentence summary of request]

STYLE & TONE:
Vary sentence structure; avoid robotic repetition.
NO EM-DASHES. Use commas, colons, or semicolons instead.
No Echoing: Do not repeat user intentions back to them.
Editing: Fix grammar and flow only. Strictly preserve the original voice and meaning. Do not over-sanitize.

ACADEMIC & STATS:
Tone: Peer-reviewed journal style, formal and objective.
Format: APA 7th Edition.
Citations: Mandatory for all statistics and research claims. Include DOI whenever available so sources can be reviewed.

R PROGRAMMING:
Output: Full script only, never snippets or revised portions.
Documentation: Include title, section headers, and comments explaining the statistical or logical purpose. Do not describe user intentions in comments.

FACULTY COVER LETTERS:
Strategy: Show, do not tell. Indirectly map experience to requirements. Never explicitly say "I fit this because..." or repeat the job post.
Structure:
Intro: Current PhD status, graduation year, and location.
K-12 Teaching.
University Teaching: Pedagogy, tools, relevant detail, no fluff.
Supervision.
Research: Content and trajectory.
Order: Follow the job description sequence.
Length: Approximately 2 pages. Include sufficient detail without filler words.

# Project: My Day Learning Town

## Root Folder Rule

- The existing root folder named `LFI games` is the main project folder and the classroom folder.
- Do not create a nested folder named `LFI Games` inside the root `LFI games` folder.
- If a nested `LFI Games` folder already exists, it is a duplicate package folder. Merge or verify any needed runtime files, then delete the duplicate after verification.
- `release/` may be used only as temporary or internal build output if the packaging script requires it.
- Do not present `release/` as the classroom package.
- After packaging, the visible start file must be at the root of `LFI games`, or in one clearly named immediate runtime folder only if Electron requires that structure.
- Duplicated package folders with old assets must be deleted after verification.
- Stale QA reports must not be kept if they conflict with current behavior.

## Purpose

Build a browser-based, touch-friendly educational mini-game platform for Grade 2 to 3 LFI students, most with intellectual disability or autism spectrum disorder, who are functioning around early kindergarten academic levels. The platform should feel like one connected learning world, similar to an ABCya-style hub with many small games inside one consistent interface.

## Student Profile

- Chronological grade level: 2 to 3
- Academic functioning: often early kindergarten level
- High support needs in literacy and math
- No typing required
- Touchscreen TV and Chromebook friendly
- Visual clarity is more important than decorative detail
- Students may perseverate on error sounds, so incorrect feedback must not be fun or rewarding

## Core Design Rules

- Use a 2D browser game stack.
- Default to Phaser 3, TypeScript, and Vite.
- Build one shared app shell with reusable mini-game templates.
- Use JSON-driven content so new games can be added without rewriting core systems.
- Support mouse and touch.
- No keyboard or text input for students.
- No timers, countdown pressure, or fail screens.
- One task per screen.
- Maximum of 3 response choices on any trial.
- Use large touch targets.
- Use high-contrast visuals and thick outlines.
- Avoid cluttered scenes and tiny details.
- Keep images simple, familiar, and clearly recognizable.
- Use familiar daily-life school and home contexts instead of generic fantasy content.

## Runtime Image Rules

- Runtime student-facing images must be PNG.
- Do not create SVG placeholders.
- Do not create SVG icons, SVG backgrounds, SVG arrows, SVG game images, or SVG category images.
- Do not use SVG as a fallback when a PNG is missing.
- Use transparent PNG for object and choice images when possible.
- Use full rectangular PNG only for backgrounds, scenes, or teaching pictures.
- Generated files must be wired into runtime before they are counted as complete.
- Old generated folders and old package assets must be removed only after a reference search proves they are unused.

## Audio Rules

- Kokoro local WAV audio is the primary student speech system.
- The expected local voice is Kokoro `af_heart` unless a newer local Kokoro setting is intentionally documented.
- Browser/default speech synthesis is fallback only for missing or failed local WAV playback.
- Microsoft, Google, OpenAI, or other cloud voices must not become the normal classroom speech path.
- The guiding sentence panel should replay its own Kokoro local WAV line when clicked.
- Guiding sentence replay, prompt speech, and praise speech must avoid overlapping narration.
- Speech volume, chime volume, and voice speed controls must keep working.
- Settings must describe the actual audio path honestly.

## Feedback Rules

- Correct answer: normal animation speed, specific spoken praise, brief positive visual response.
- Incorrect answer: neutral response only, no silly or rewarding sound.
- Wrong choice should move very slowly or minimally, then stop.
- Let students replay directions by clicking the visible guiding sentence.
- Add optional audio on or off control for adults.
- Spoken praise should say what the student did correctly, for example:
  - Great job finding the matching number.
  - Nice work building the word.
  - Awesome job putting the story in order.
- Use simple child-friendly language, not academic jargon.

## Accessibility And Visual Rules

- High contrast colors.
- Thick borders and clear separation between answer choices.
- Sans serif font, large size.
- Avoid faded dotted tracing lines.
- Tracing lines must be bold and highly visible.
- Pair tracing with a relevant image, for example number 2 with two oranges.
- Minimize motion except when needed for feedback.
- Keep all UI readable on a classroom touchscreen TV from a distance.
- Visuals should be larger than text when space is limited.
- Text should shrink before visuals become tiny.

## Platform Theme

Use real-life environments students know:

- Home
- Bus stop
- Classroom
- Cafeteria
- Playground
- School hallway
- Library
- School store
- Neighborhood park

## Initial Content Priority

Build literacy and math first.

Literacy targets:

- phonics
- phoneme awareness
- same sound or not same sound
- rhyme and rime group
- sight words
- CVC words
- long vowel contrasts
- sentence structure
- punctuation
- capitalization
- context clues
- story order
- mechanical writing
- opinion writing using preset movable sentence parts only

Math targets:

- recognizing numbers 1 to 30
- stretching goal 1 to 100
- making sets
- addition within 10
- subtraction within 10
- slightly advanced addition and subtraction within 20
- shapes, 2D and 3D
- equal shares and basic fraction concepts
- measure with visible units
- early algebraic thinking only with visuals, never symbol-only unknowns

## Writing Rules

- Do not require original writing from students.
- For sentence or opinion activities, use preset draggable sentence parts.
- Teach capitalization, spacing, punctuation, and sentence order through manipulation.
- Read the built sentence aloud after completion.

## Technical Rules

- Create a shared game shell with:
  - home hub
  - reusable instruction panel
  - repeat-directions button
  - audio toggle
  - simple settings menu
  - local progress storage
- Use localStorage for progress and settings.
- Create a content registry for mini-games.
- Keep code modular and documented.
- Use local Kokoro WAV files for primary classroom speech.
- Keep browser speech synthesis only as an emergency fallback when local WAV playback is missing or unavailable.
- Structure the code so future science and social studies packs can plug into the same shell.

## Preferred Reusable Game Templates

Create reusable templates for:

1. choose 1 of 3
2. drag and match
3. drag into slots
4. drag into sequence
5. tracing path
6. sort into bins

## Documentation Rules

- `README.md` should tell the user how to run the game from the main `LFI games` folder.
- `CURRENT_QA_SUMMARY.md` is the main current QA reference.
- Old recovery, remediation, image, audio, packaging, and screen reports must be merged into current docs or deleted if stale.
- Do not keep duplicate reports that say different things.

## Done Criteria For Each Mini-Game

- Works with touch and mouse.
- Has instructions, repeat button, and specific praise.
- Uses only 3 choices when choice is required.
- Has at least 10 playable content rounds.
- Fits the existing shell and returns to the hub.
- Uses daily-life vocabulary and visuals.
- Passes a quick browser smoke test.
