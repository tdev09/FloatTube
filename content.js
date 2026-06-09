// content.js v1.0.0 — FINAL
// 
// Root cause of all bugs identified from logs:
// The visibilitychange handler was firing BEFORE mediaSession and calling
// requestPictureInPicture() without a user gesture → NotAllowedError.
// This failed call was interfering with the subsequent mediaSession call
// which would have succeeded. Removing visibilitychange enter path entirely.
//
// Architecture:
// - ENTER: mediaSession "enterpictureinpicture" only (Chrome calls this correctly)
// - EXIT:  Chrome handles automatically when tab becomes visible (per spec)
// - We never call exitPictureInPicture() manually

"use strict";

const LOG = (...a) => console.log("[AutoPiP]", ...a);

let settings = { enabled: true, autoExit: true, delayMs: 0 };
let pipDelayTimer = null;
let initialized = false;

function loadSettings(cb) {
  chrome.storage.sync.get(
    { enabled: true, autoExit: true, delayMs: 0 },
    (s) => { settings = s; if (cb) cb(); }
  );
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SETTINGS_UPDATED") {
    settings = { ...settings, ...msg.settings };
    if (!settings.enabled) {
      unregisterMediaSession();
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    } else {
      const v = getVideo();
      if (v) registerMediaSession(v);
    }
    return false;
  }
  if (msg.type === "GET_STATUS") {
    sendResponse({ videoFound: !!getVideo(), pipActive: !!document.pictureInPictureElement });
    return true;
  }
  return false;
});

function getVideo() {
  return document.querySelector("video.html5-main-video") || document.querySelector("video");
}

async function enterPiP(video) {
  if (!settings.enabled) return;
  if (document.pictureInPictureElement) return;
  if (!video || video.ended) return;

  video.disablePictureInPicture = false;

  try {
    await video.requestPictureInPicture();
    LOG("PiP entered ✓");
  } catch (err) {
    LOG("Enter failed:", err.name, "-", err.message);
  }
}

function unregisterMediaSession() {
  try { navigator.mediaSession.setActionHandler("enterpictureinpicture", null); } catch (_) {}
}

function registerMediaSession(video) {
  unregisterMediaSession();
  if (!settings.enabled) return;

  try {
    navigator.mediaSession.setActionHandler("enterpictureinpicture", async () => {
      LOG("mediaSession action fired");
      clearTimeout(pipDelayTimer);
      if (settings.delayMs > 0) {
        pipDelayTimer = setTimeout(() => enterPiP(video), settings.delayMs);
      } else {
        await enterPiP(video);
      }
    });
    // Belt-and-suspenders: also set the attribute
    video.autoPictureInPicture = true;
    video.disablePictureInPicture = false;
    LOG("Ready ✓");
  } catch (err) {
    LOG("mediaSession register failed:", err.message);
  }
}

function waitForVideo(cb, timeout = 10000) {
  const v = getVideo();
  if (v) { cb(v); return; }
  const obs = new MutationObserver(() => {
    const found = getVideo();
    if (found) { obs.disconnect(); cb(found); }
  });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), timeout);
}

function init() {
  if (initialized) return;
  initialized = true;
  loadSettings(() => {
    waitForVideo((video) => {
      registerMediaSession(video);
    });
  });
}

function cleanup() {
  initialized = false;
  clearTimeout(pipDelayTimer);
  unregisterMediaSession();
  const v = getVideo();
  if (v) v.autoPictureInPicture = false;
}

document.addEventListener("yt-navigate-finish", () => {
  cleanup();
  setTimeout(init, 300);
});

init();
