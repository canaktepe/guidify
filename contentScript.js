const SETTINGS_KEY = "enableFileHelper";
const DEFAULT_SETTINGS = {
  [SETTINGS_KEY]: true,
  caseFormat: "lowercase"
};
const BUTTON_CLASS = "guid-upload-helper-btn";
let enabled = true;
let savedCaseFormat = "lowercase";
const processedInputs = new WeakSet();
const helperButtons = new Set();

// Lightweight GUID generator (copied from src/guidGenerator.js to avoid dynamic import issues)
function generateGuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
  }

  // fallback non-crypto
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

function generateGuids(count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("count must be a positive integer");
  }
  return Array.from({ length: count }, () => generateGuid());
}

function createStyles() {
  if (document.getElementById("guid-upload-helper-style")) return;
  const style = document.createElement("style");
  style.id = "guid-upload-helper-style";
  style.textContent = `
    .${BUTTON_CLASS} {
      all: unset;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.08);
      background: linear-gradient(120deg, #0ea5e9, #22d3ee);
      color: #0b1220;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
      box-shadow: 0 6px 16px rgba(34, 211, 238, 0.28);
      transition: transform 0.08s ease, box-shadow 0.1s ease, filter 0.1s ease;
    }
    .${BUTTON_CLASS}:hover {
      transform: translateY(-1px);
      filter: brightness(1.04);
    }
    .${BUTTON_CLASS}:active {
      transform: translateY(0);
      box-shadow: 0 3px 10px rgba(34, 211, 238, 0.2);
    }
  `;
  document.head.appendChild(style);
}

async function attachButton(input) {
  if (!enabled || processedInputs.has(input)) return;
  if (input.type !== "file" || input.disabled) return;

  processedInputs.add(input);
  createStyles();

  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.title = "Generate GUIDs and upload as .txt file to this field";
  button.textContent = "Load GUIDs";
  button.style.marginLeft = "8px";

  helperButtons.add(button);

  button.addEventListener("click", () => handleClick(input));

  // Insert after the input
  input.insertAdjacentElement("afterend", button);
}

function detachButtons() {
  helperButtons.forEach((btn) => {
    btn.remove();
  });
  helperButtons.clear();
  processedInputs.clear();
}

function makeFilename() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
  return `generated-guids-${stamp}.txt`;
}

async function handleClick(input) {
  const countStr = prompt("How many GUIDs to generate? (1-100,000)", "10");
  if (countStr === null) return;
  const count = Number.parseInt(countStr, 10);
  if (!Number.isInteger(count) || count < 1 || count > 100000) {
    alert("Please enter a whole number between 1 and 100,000.");
    return;
  }

  // Use saved case format preference (no prompt)
  const useUppercase = savedCaseFormat === "uppercase";

  // Varsayılan dosya adı - timestamp ile her zaman benzersiz
  const filename = makeFilename();

  try {
    const guids = generateGuids(count);
    const processedGuids = useUppercase
      ? guids.map(g => g.toUpperCase())
      : guids.map(g => g.toLowerCase());
    const text = processedGuids.join("\n");
    console.log("[GUID Helper] Varsayılan dosya adı:", filename);
    const downloadResult = await downloadGuids(text, filename);
    console.log("[GUID Helper] İndirme sonucu:", downloadResult);
    if (!downloadResult.ok) {
      alert(`Download failed: ${downloadResult.error || "unknown"}`);
      return;
    }
    const finalFilename = downloadResult.filename || filename;
    console.log("[GUID Helper] Input'a yüklenecek dosya adı:", finalFilename);
    await uploadTextFileToInput(input, text, finalFilename);
  } catch (err) {
    console.error("GUID generation or upload error", err);
    alert(`Failed to generate or upload GUIDs: ${err?.message || err}`);
  }
}

function sendDownloadMessage(guidText, filename) {
  return new Promise((resolve) => {
    const message = { type: "download-guids", text: guidText, filename, saveAs: true };
    console.log("[GUID Helper] Background'a gönderilen mesaj:", message);
    chrome.runtime.sendMessage(
      message,
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Mesaj hatası:", chrome.runtime.lastError.message);
          resolve({ ok: false, error: chrome.runtime.lastError.message });
          return;
        }
        console.log("[GUID Helper] Background'dan gelen yanıt:", response);
        resolve(response || { ok: false, error: "Bilinmeyen indirme yanıtı" });
      }
    );
  });
}

function fallbackDownload(guidText, filename) {
  try {
    const blob = new Blob([guidText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn("Fallback download error:", err);
  }
}

async function downloadGuids(guidText, filename) {
  const result = await sendDownloadMessage(guidText, filename);
  if (result.ok) return { ok: true, filename: result.filename || filename };

  // fallback
  fallbackDownload(guidText, filename);
  return { ok: true, filename };
}

async function uploadTextFileToInput(input, text, filename) {
  // Clear previous selection to avoid stale file being reused
  input.value = "";

  const file = new File([text], filename, { type: "text/plain" });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;

  // Trigger change event for listeners
  const changeEvent = new Event("change", { bubbles: true });
  input.dispatchEvent(changeEvent);
}

function scanInputs(root = document) {
  const inputs = root.querySelectorAll('input[type="file"]');
  inputs.forEach((input) => attachButton(input));
}

function initObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.tagName === "INPUT" && node.type === "file") {
          attachButton(node);
        } else {
          scanInputs(node);
        }
      });
    }
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
}

function loadSettingAndInit() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    enabled = Boolean(settings[SETTINGS_KEY]);
    savedCaseFormat = settings.caseFormat || "lowercase";
    if (enabled) {
      scanInputs();
      initObserver();
    } else {
      detachButtons();
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;

  if (changes[SETTINGS_KEY]) {
    enabled = Boolean(changes[SETTINGS_KEY].newValue);
    if (enabled) {
      scanInputs();
    } else {
      detachButtons();
    }
  }

  if (changes.caseFormat) {
    savedCaseFormat = changes.caseFormat.newValue || "lowercase";
  }
});

loadSettingAndInit();
