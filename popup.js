import { generateGuids } from "./src/guidGenerator.js";

const countInput = document.getElementById("count");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const settingsBtn = document.getElementById("settings-btn");
const statusEl = document.getElementById("status");
const output = document.getElementById("output");

const DEFAULT_SETTINGS = {
  caseFormat: "lowercase"
};

function setStatus(message, type = "ok") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function downloadGuids(guidText) {
  const blob = new Blob([guidText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download(
    {
      url,
      filename: "generated-guids.txt",
      saveAs: false
    },
    (downloadId) => {
      URL.revokeObjectURL(url);
      if (chrome.runtime.lastError) {
        setStatus(`Download error: ${chrome.runtime.lastError.message}`, "error");
        return;
      }
      setStatus(`Success! File downloaded. (id: ${downloadId})`, "ok");
    }
  );
}

function generateAndProcess() {
  const count = Number.parseInt(countInput.value, 10);
  if (!Number.isInteger(count) || count < 1 || count > 100000) {
    setStatus("Please enter a whole number between 1 and 100,000.", "error");
    return null;
  }

  try {
    const guids = generateGuids(count);

    // Get selected case option (from radio buttons)
    const caseOption = document.querySelector('input[name="case"]:checked').value;
    const processedGuids = caseOption === 'uppercase'
      ? guids.map(g => g.toUpperCase())
      : guids.map(g => g.toLowerCase());

    const text = processedGuids.join("\n");
    output.value = text;
    return { text, count };
  } catch (err) {
    setStatus(err.message || "Unknown error", "error");
    return null;
  }
}

function onDownload() {
  const result = generateAndProcess();
  if (!result) return;

  setStatus(`${result.count} GUIDs generated, preparing .txt file...`, "ok");
  downloadGuids(result.text);
}

function onCopy() {
  const result = generateAndProcess();
  if (!result) return;

  navigator.clipboard.writeText(result.text)
    .then(() => {
      setStatus(`${result.count} GUIDs copied to clipboard!`, "ok");
    })
    .catch((err) => {
      setStatus(`Failed to copy: ${err.message}`, "error");
    });
}

// Load saved case format preference
function loadCasePreference() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
    const caseFormat = result.caseFormat || "lowercase";
    const radioToCheck = document.querySelector(`input[name="case"][value="${caseFormat}"]`);
    if (radioToCheck) {
      radioToCheck.checked = true;
    }
  });
}

downloadBtn.addEventListener("click", onDownload);
copyBtn.addEventListener("click", onCopy);

countInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    onDownload();
  }
});

settingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Save case preference when changed
document.querySelectorAll('input[name="case"]').forEach(radio => {
  radio.addEventListener("change", (event) => {
    chrome.storage.sync.set({ caseFormat: event.target.value });
  });
});

// Load preferences on startup
loadCasePreference();
