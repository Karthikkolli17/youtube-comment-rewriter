const COMMENT_SELECTOR = [
  "ytd-comment-thread-renderer #content-text",
  "ytd-comment-view-model #content-text",
  "ytd-comment-renderer #content-text",
  "ytd-comment-thread-renderer yt-attributed-string#content-text",
  "ytd-comment-view-model yt-attributed-string#content-text",
  "ytd-comment-renderer yt-attributed-string#content-text"
].join(", ");
const LIVE_CHAT_SELECTOR = [
  "yt-live-chat-text-message-renderer #message",
  "yt-live-chat-paid-message-renderer #message",
  "yt-live-chat-paid-sticker-renderer #message",
  "yt-live-chat-membership-item-renderer #message",
  "yt-live-chat-viewer-engagement-message-renderer #message"
].join(", ");
const TARGET_SELECTOR = [COMMENT_SELECTOR, LIVE_CHAT_SELECTOR].join(", ");

const DEFAULT_SETTINGS = {
  replacementText: "skibidi",
  enabled: true
};

let activeObserver = null;
let pendingRewrite = false;
let replaySweepTimerId = null;
let settings = { ...DEFAULT_SETTINGS };

function sanitizeReplacementText(value) {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_SETTINGS.replacementText;
}

function getNormalizedSettings(rawSettings = {}) {
  return {
    enabled: rawSettings.enabled !== false,
    replacementText: sanitizeReplacementText(rawSettings.replacementText)
  };
}

function skibidifyWithPunctuation(text, replacementText) {
  return text.replace(/\b[\p{L}\p{N}_']+\b/gu, replacementText);
}

function rewriteComment(node) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  const currentText = node.textContent ?? "";
  const previousOutput = node.dataset.skibidiLastOutput;
  const hadOriginalText = typeof node.dataset.skibidiOriginalText === "string";
  const sourceText = hadOriginalText ? node.dataset.skibidiOriginalText : currentText;

  if (previousOutput && currentText !== previousOutput) {
    node.dataset.skibidiOriginalText = currentText;
  } else if (!hadOriginalText) {
    node.dataset.skibidiOriginalText = currentText;
  }

  const stableSourceText = node.dataset.skibidiOriginalText ?? currentText;

  if (!settings.enabled) {
    if (currentText !== stableSourceText) {
      node.textContent = stableSourceText;
    }
    delete node.dataset.skibidiLastOutput;
    delete node.dataset.skibidiRewritten;
    return;
  }

  const rewrittenText = skibidifyWithPunctuation(
    stableSourceText,
    settings.replacementText
  );

  if (node.dataset.skibidiRewritten === "true" && currentText === rewrittenText) {
    return;
  }

  node.textContent = rewrittenText;
  node.dataset.skibidiRewritten = "true";
  node.dataset.skibidiLastOutput = rewrittenText;
}

function rewriteAllComments(root = document) {
  const comments = [];
  if (root instanceof Element && root.matches?.(TARGET_SELECTOR)) {
    comments.push(root);
  }
  comments.push(...root.querySelectorAll(TARGET_SELECTOR));
  comments.forEach(rewriteComment);
}

function scheduleRewrite(root = document) {
  if (pendingRewrite) {
    return;
  }

  pendingRewrite = true;
  requestAnimationFrame(() => {
    pendingRewrite = false;
    rewriteAllComments(root);
  });
}

function createObserver() {
  return new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (!(addedNode instanceof Element)) {
          continue;
        }

        if (addedNode.matches?.(TARGET_SELECTOR)) {
          rewriteComment(addedNode);
          continue;
        }

        if (
          addedNode.querySelector?.(TARGET_SELECTOR)
        ) {
          scheduleRewrite(addedNode);
        }
      }
    }
  });
}

function reconnectObserver() {
  if (activeObserver) {
    activeObserver.disconnect();
  }

  activeObserver = createObserver();
  activeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function restartReplaySweep() {
  if (replaySweepTimerId !== null) {
    clearInterval(replaySweepTimerId);
  }

  // Chat replay can update existing message nodes without adding new elements.
  // A lightweight sweep keeps replay text rewritten even for those updates.
  replaySweepTimerId = setInterval(() => {
    scheduleRewrite();
  }, 1000);
}

function start() {
  scheduleRewrite();
  reconnectObserver();
  restartReplaySweep();
}

function loadSettingsAndStart() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (storedSettings) => {
    settings = getNormalizedSettings(storedSettings);
    start();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadSettingsAndStart, { once: true });
} else {
  loadSettingsAndStart();
}

document.addEventListener("yt-navigate-finish", () => {
  start();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  if (!changes.enabled && !changes.replacementText) {
    return;
  }

  settings = getNormalizedSettings({
    enabled: changes.enabled ? changes.enabled.newValue : settings.enabled,
    replacementText: changes.replacementText
      ? changes.replacementText.newValue
      : settings.replacementText
  });
  scheduleRewrite();
});
