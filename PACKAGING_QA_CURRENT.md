# Packaging QA Current

Last updated: 2026-05-07

## Folder Status

- Main folder: `C:\Users\Sungwoo\OneDrive\바탕 화면\LFI games`.
- Root classroom EXE: `C:\Users\Sungwoo\OneDrive\바탕 화면\LFI games\My Day Learning Town.exe`.
- Nested `LFI Games` folder: not present.
- `release` folder: not present after packaging cleanup.
- Root runtime folders present: `resources/`, `locales/`, Electron DLL and PAK files.

## Commands Run

- `npm run build`: PASS outside sandbox after sandbox Vite `spawn EPERM`.
- `npm run desktop:package`: PASS.
- Root EXE launch check: PASS, process started from the main folder and stayed alive after 6 seconds.

## Notes

- The packaging script uses `release/` internally as temporary output, copies the runtime files to the main root, then removes temporary release output.
- The visible classroom start file remains at the main folder root.
