# YouTube Comment Rewriter

Chrome extension that rewrites YouTube comments, live chat, and chat replay using configurable replacement text.

## Features

- Custom replacement word or phrase (for example, `redacted`, `spoiler`, `placeholder`)
- Enable/disable toggle from the extension popup
- Preserves original punctuation and token count layout
- Supports dynamic page navigation, live chat, and chat replay updates

## Installation (Unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## Usage

1. Open a YouTube page with comments or live chat.
2. Click the extension icon.
3. Enter replacement text and click **Save**.
4. Keep **Enable rewrite** checked to apply rewriting.

To restore visible original text, uncheck **Enable rewrite** and click **Save**.

## Development Workflow

After local code changes:

1. Open `chrome://extensions`
2. Reload **YouTube Comment Rewriter**
3. Refresh the YouTube tab

## Technical Notes

- Works on `youtube.com` watch pages and dynamic navigation
- Content script runs on `https://www.youtube.com/`*
- Rewrites are batched with `requestAnimationFrame` for lower UI overhead
- Settings are persisted with `chrome.storage.sync`
- A replay-safe periodic sweep is used to catch chat replay text mutations

