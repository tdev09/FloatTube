// popup.js
// Controls the extension popup: reads/writes settings, shows live status.

"use strict";

const $ = (id) => document.getElementById(id);

const toggleEnabled  = $("toggle-enabled");
const toggleAutoExit = $("toggle-autoexit");
const selectDelay    = $("select-delay");
const statusEnabled  = $("status-enabled");
const statusVideo    = $("status-video");
const statusPip      = $("status-pip");

function setStatus(el, text, cssClass) {
  el.textContent = text;
  el.className = "status-value " + (cssClass || "");
}

function updateStatusDisplay(settings) {
  setStatus(
    statusEnabled,
    settings.enabled ? "Enabled" : "Disabled",
    settings.enabled ? "on" : "off"
  );
}

chrome.storage.sync.get(
  { enabled: true, autoExit: true, delayMs: 0 },
  (settings) => {
    toggleEnabled.checked  = settings.enabled;
    toggleAutoExit.checked = settings.autoExit;
    selectDelay.value      = String(settings.delayMs);
    updateStatusDisplay(settings);
    queryTabStatus();
  }
);

function queryTabStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.url.includes("youtube.com/watch")) {
      setStatus(statusVideo, "Not on YouTube", "off");
      setStatus(statusPip,   "—", "off");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "GET_STATUS" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setStatus(statusVideo, "Loading…", "off");
        setStatus(statusPip,   "—", "off");
        return;
      }

      setStatus(
        statusVideo,
        response.videoFound ? "Yes" : "No",
        response.videoFound ? "yes" : "no"
      );
      setStatus(
        statusPip,
        response.pipActive ? "Active" : "No",
        response.pipActive ? "active" : "no"
      );
    });
  });
}

function saveSettings() {
  const settings = {
    enabled:  toggleEnabled.checked,
    autoExit: toggleAutoExit.checked,
    delayMs:  parseInt(selectDelay.value, 10)
  };

  chrome.storage.sync.set(settings, () => {
    updateStatusDisplay(settings);
    chrome.runtime.sendMessage({
      type: "SETTINGS_UPDATED",
      settings
    });
  });
}

toggleEnabled.addEventListener("change",  saveSettings);
toggleAutoExit.addEventListener("change", saveSettings);
selectDelay.addEventListener("change",    saveSettings);
