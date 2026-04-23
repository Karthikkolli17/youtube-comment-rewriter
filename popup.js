const DEFAULT_SETTINGS = {
  replacementText: "redacted",
  enabled: true
};

const replacementInput = document.getElementById("replacement-text");
const enabledCheckbox = document.getElementById("enabled");
const saveButton = document.getElementById("save-button");
const statusText = document.getElementById("status");

function setStatus(message) {
  statusText.textContent = message;
}

function normalizeReplacementText(value) {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_SETTINGS.replacementText;
}

function loadSettings() {
  // Initialize popup controls from persisted user settings.
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    replacementInput.value = normalizeReplacementText(settings.replacementText);
    enabledCheckbox.checked = settings.enabled !== false;
  });
}

function saveSettings() {
  const replacementText = normalizeReplacementText(replacementInput.value);
  const enabled = enabledCheckbox.checked;

  // Persist settings so all YouTube tabs update consistently.
  chrome.storage.sync.set({ replacementText, enabled }, () => {
    replacementInput.value = replacementText;
    setStatus("Saved.");
    setTimeout(() => setStatus(""), 1200);
  });
}

saveButton.addEventListener("click", saveSettings);
replacementInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveSettings();
  }
});

loadSettings();
