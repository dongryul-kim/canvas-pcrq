
# Canvas PCRQ helper

This a simple Chrome extension for facilitating grading of Pre-Class Reading
Quizzes for Stanford math classes. It injects Javascript code to hide
unnecessary elements and creates hotkeys.

| key | functionality |
|:-:|---|
| z | Gives full marks to all ungraded questions and saves it |
| x | Gives zero points to all ungraded questions and saves it |
| &larr; | Select previous student |
| &rarr; | Select next student |
| s | Shows all hidden elements |

## Stability

This was created via a crude reverse-engineering of Canvas's frontend. Nothing
is stable.

## Installation

1. Download the source folder via `git clone` or downloading and unzipping.
1. Navigate to [chrome://extensions](chrome://extensions) and turn on developer
   mode.
1. Load unpacked extension from the downloaded folder.

## Troubleshooting

* If the keys are not working, it might be because the wrong element is focused.
  Try clicking the sidebar.

