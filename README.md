# Skibidi YouTube Comments + Live Chat

A tiny Chrome extension that rewrites YouTube comments and live chat messages to your chosen replacement text, while preserving word count and punctuation layout.

## Install

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this folder:

`/Users/karthikkolli/Documents/New project`

## How to use

1. Open any YouTube video page with comments.
2. Click the extension icon and set your replacement word or phrase.
3. Keep **Enable rewrite** checked and click **Save**.
4. Scroll to the comments section.
5. All visible comment text is rewritten to your chosen text.
6. Keep scrolling; newly loaded comments are rewritten automatically.
7. Navigate to another video; it keeps working after YouTube page transitions.
8. On livestream pages, open live chat; incoming messages are rewritten too.
9. Word count is preserved (for example, a 10-word message becomes 10 replacements).
10. Punctuation is preserved where possible (`!`, `?`, commas, quotes, etc.).

## Toggle behavior

- Turn **Enable rewrite** off in the popup and click **Save** to restore original visible text.
- Turn it back on anytime to reapply rewriting.

## Update after code changes

1. Go to `chrome://extensions`
2. Find **Skibidi YouTube Comments**
3. Click the reload icon on the extension card
4. Refresh the YouTube tab

## Notes

- Works on `youtube.com` watch pages and dynamic navigation
- Supports live chat and chat replay frames
- Uses storage-backed user settings with live updates
- Uses a document observer plus replay-safe sweep to handle chat replay updates