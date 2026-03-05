
# Canvas PCRQ helper

This is a browser extension for facilitating grading of Pre-Class Reading
Quizzes for Stanford math classes. It injects Javascript code to hide
unnecessary elements, creates hotkeys, and auto-navigates between students.

## Features

- Automatically hides already-graded questions and non-essential UI elements
- Auto-skips students with no submission (after a 3-second timeout)
- Visual feedback overlay showing grading status
- Key debouncing to prevent accidental double-presses
- Ignores hotkeys when typing in input fields

## Hotkeys

| Key | Function |
|:-:|---|
| z | Full marks to all ungraded questions, save, and next student |
| x | Zero points to all ungraded questions, save, and next student |
| c | Zero grade for no submission and next student |
| &larr; | Previous student |
| &rarr; | Next student |
| s | Show all hidden elements |

## Stability

This was created via a crude reverse-engineering of Canvas's frontend. Nothing
is stable.

## Installation

1. Download the source folder via `git clone` or downloading and unzipping.
1. Navigate to your browser's extensions page and turn on developer mode.
   - Chrome: [chrome://extensions](chrome://extensions)
   - Firefox: [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)
1. Load the unpacked extension from the downloaded folder (Chrome) or load it as
   a temporary add-on (Firefox).

## Troubleshooting

- If hotkeys are not working, click somewhere outside the iframe (e.g. the
  sidebar) to ensure the parent document has focus.

