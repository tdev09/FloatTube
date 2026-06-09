// background.js
// Service worker for FloatTube
// v1.1 — removed scripting injection (content_scripts in manifest handles this)

"use strict";

const DEFAULT_SETTINGS = {
  enabled: true,
  autoExit: true,
  delayMs: 0
};

// Set defaults on first install — don't overwrite existing user settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.sync.set(stored);
  });
});

// Relay settings changes from popup to all active YouTube watch tabs
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SETTINGS_UPDATED") {
    chrome.tabs.query({ url: "https://www.youtube.com/watch*" }, (tabs) => {
      for (const tab of tabs) {
        if (tab.id != null) {
          chrome.tabs.sendMessage(tab.id, message, () => {
            // Suppress "no receiving end" errors — tab may not have content script yet
            void chrome.runtime.lastError;
          });
        }
      }
    });
    sendResponse({ ok: true });
  }

  return true; // keep message channel open for async response
});
