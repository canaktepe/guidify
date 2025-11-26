const enableHelperCheckbox = document.getElementById("enable-helper");
const caseLowercaseRadio = document.getElementById("case-lowercase");
const caseUppercaseRadio = document.getElementById("case-uppercase");

const DEFAULT_SETTINGS = {
  enableFileHelper: true,
  caseFormat: "lowercase"
};

function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
    enableHelperCheckbox.checked = Boolean(result.enableFileHelper);

    const caseFormat = result.caseFormat || "lowercase";
    if (caseFormat === "uppercase") {
      caseUppercaseRadio.checked = true;
    } else {
      caseLowercaseRadio.checked = true;
    }
  });
}

function saveSetting(key, value) {
  chrome.storage.sync.set({ [key]: value });
}

enableHelperCheckbox.addEventListener("change", (event) => {
  saveSetting("enableFileHelper", event.target.checked);
});

caseLowercaseRadio.addEventListener("change", () => {
  if (caseLowercaseRadio.checked) {
    saveSetting("caseFormat", "lowercase");
  }
});

caseUppercaseRadio.addEventListener("change", () => {
  if (caseUppercaseRadio.checked) {
    saveSetting("caseFormat", "uppercase");
  }
});

loadSettings();
