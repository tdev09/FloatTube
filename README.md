# FloatTube 🎥

**FloatTube** is a lightweight, high-performance Chrome Extension (Manifest V3) that provides **Auto Picture-in-Picture (PiP)** for YouTube. It automatically floats your video into a Picture-in-Picture window when you switch tabs, and returns it to the web page when you return.

---

## ✨ Features

- **Automatic Picture-in-Picture**: Seamlessly floats the active YouTube video when switching to another tab or browser window.
- **Sleek Popup Control Panel**:
  - **Auto Float Toggle**: Turn the automatic floating feature on or off globally.
  - **Snap Back on Return**: Seamlessly returns the video to the YouTube page when you switch back.
  - **Float Delay**: Configurable transition delay (`Instant`, `1 second`, `3 seconds`, or `5 seconds`) to prevent unnecessary floating on quick tab flips.
  - **Live Status Indicators**: Shows whether a YouTube video is detected on the active tab and whether the Picture-in-Picture window is currently active.
- **Robust Navigation Support**: Built-in support for YouTube's Single Page Application (SPA) navigation transitions (`yt-navigate-finish`).

---

## 🛠️ Technical Architecture

FloatTube utilizes modern web APIs and Chrome Extension mechanisms for performance and compatibility:

1. **Manifest V3**: Complies with Chrome's latest extension security and structure standards.
2. **MediaSession API Integration**: Registers action handlers for `enterpictureinpicture` via the browser's `navigator.mediaSession` combined with the video element's `autoPictureInPicture` property. This ensures PiP is requested cleanly without violating user-gesture restrictions.
3. **Service Worker Relay**: `background.js` listens to popup settings updates and propagates changes in real time using `chrome.runtime` messaging to all open YouTube tabs.
4. **Storage Sync**: Settings are persisted across devices via `chrome.storage.sync`.

---

## 📁 Project Structure

```text
├── manifest.json       # Extension metadata and permission definitions
├── background.js       # Background Service Worker managing state propagation
├── content.js          # Content script injected into YouTube watch pages
├── popup.html          # HTML structure for the extension popup UI
├── popup.css           # Vanilla CSS styling for the popup UI
├── popup.js            # Frontend logic for the settings panel and tab status
└── icons/              # Extension icons (16px, 48px, 128px)
```

---

## 🚀 Installation (Developer Mode)

To load and use FloatTube locally in your Chrome browser:

1. Clone or download this repository to a directory on your machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. In the top-right corner, toggle the **Developer mode** switch **ON**.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `floatTube` directory (the one containing `manifest.json`).
6. Pin **FloatTube** to your Chrome toolbar for quick access!

---

## ⚙️ Configuration & Settings

Click on the FloatTube toolbar icon to access settings:

| Setting | Type | Description |
| :--- | :--- | :--- |
| **Auto Float** | Toggle | Toggle automatic PiP on/off. |
| **Snap back on return** | Toggle | Enable or disable automatic PiP exit when you focus back on the YouTube tab. |
| **Float after** | Select dropdown | Choose delay duration (`Instant`, `1s`, `3s`, `5s`) before the video floats after switching tabs. |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
