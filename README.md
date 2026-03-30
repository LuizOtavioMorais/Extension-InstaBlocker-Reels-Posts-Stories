# 🎬 Reels Blocker — Browser Extension (v3.0)

A browser extension that allows you to **hide Reels, Posts, and Stories** on Instagram. It works on **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, and any Chromium-based browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎬 **Hide Reels** | Removes Reels from the main feed, suggested Reels carousels, the Reels tab on profiles, and Reel modals |
| 📷 **Hide Posts** | Removes posts with images from the feed (automatically differentiates posts from Reels) |
| ⏳ **Hide Stories** | Removes the Stories bar at the top of the feed and stories in the sidebar |
| 🌍 **Multi-language Support (i18n)** | Automatically translates the extension's interface based on your browser's language. Supported: English, Portuguese, Spanish, French, German, Italian, Japanese, Chinese, Russian, and Hindi. |

## 🖥️ Control Panel

The extension adds a **floating button** (☰) in the top right corner of Instagram. Clicking it reveals a dropdown with toggles to enable/disable each feature individually.

Settings are **automatically saved** in your browser's local storage, meaning your preferences persist across sessions.

---

## 📦 Installation

### Google Chrome / Microsoft Edge (Chromium)

1. **Download the code** — Clone the repository or download it as a ZIP and extract it:

   ```bash
   git clone https://github.com/LuizOtavioMorais/Extension-InstaBlocker-Reels-Posts-Stories.git
   ```

2. **Access the extensions page** in your browser:
   - **Chrome:** Type `chrome://extensions` in the address bar
   - **Edge:** Type `edge://extensions` in the address bar

3. **Enable Developer Mode** — In the top right corner of the page, toggle **"Developer mode"**.

4. **Load the extension** — Click the **"Load unpacked"** button.

5. **Select the folder** — Navigate to the folder where you downloaded/extracted the project (`Extension-InstaBlocker-Reels-Posts-Stories`) and select it.

6. **Done!** ✅ — The extension will appear in your list of installed extensions. Open Instagram and the control panel will be available.

### Mozilla Firefox

1. **Download the code** — Clone the repository or download as ZIP and extract.

2. **Access the debugging page:** Type `about:debugging#/runtime/this-firefox` in the address bar.

3. **Load temporary add-on** — Click on **"Load Temporary Add-on..."**.

4. **Select the `manifest.json` file** inside the project folder.

5. **Done!** ✅ — The extension will be loaded temporarily (it will be removed when you close Firefox).

> ⚠️ **Note:** In Firefox, extensions loaded in debugging mode are **temporary**. For permanent installation, you need to sign the extension via [addons.mozilla.org](https://addons.mozilla.org).

---

## 🚀 How to Use

1. **Open Instagram** ([instagram.com](https://www.instagram.com)) in your browser.

2. **Locate the button** — In the top right corner of the page, you'll see a button with Instagram colors (purple/red/yellow gradient) and a ☰ icon.

3. **Click the button** — A dropdown panel will appear with the options:

   - 🎬 **Reels** — Hides Reels in the feed
   - 📷 **Posts** — Hides posts with images
   - ⏳ **Stories** — Hides the Stories bar

4. **Toggle the options** as you wish — each option works independently.

5. **Settings are saved automatically** — when you reopen Instagram, your preferences will be kept.

---

## 📁 Project Structure

```
Extension-InstaBlocker-Reels-Posts-Stories/
├── manifest.json    # Extension configuration (Manifest V3)
├── content.js       # Main script injected into Instagram
├── styles.css       # Control panel styles and hiding rules
├── _locales/        # i18n translation folders for multiple languages
├── icons/           # Extension icons (16, 32, 48, 128px)
│   ├── 16.png
│   ├── 32.png
│   ├── 48.png
│   └── 128.png
└── README.md        # This file
```

### File Description

| File | Description |
|---|---|
| `manifest.json` | Defines extension metadata, permissions (`storage`), and which scripts/styles to inject. Uses **Manifest V3** with Firefox (Gecko) compatibility. |
| `content.js` | Script injected into all Instagram pages. Contains all logic: Reels/Posts detection, control panel, settings persistence, and infinite scroll management. |
| `styles.css` | Floating panel styles (button, dropdown, toggles) and CSS hiding rules for Reels, Posts, and Stories. |
| `_locales/` | Contains the translation files `messages.json` grouped by language codes (e.g., `en`, `pt_BR`, `es`). |

---

## ⚙️ How it Works (Technical Overview)

### Strategy: "Ghost in Place"

Instagram uses **list virtualization** — it estimates item heights to calculate scroll positions. If we simply remove an element with `display: none`, the total height changes and causes **visual jumps** while scrolling.

The adopted solution is to transform the element into a **"ghost"**: it remains in the DOM with `height: 0`, `overflow: hidden`, and `opacity: 0`, keeping the layout flow intact while being completely invisible and inert.

### Content Detection

- **Reels:** Detected by links containing `/reel/` or `/reels/`, SVGs with `aria-label` containing "reel", "Reels" text in the header, or videos with a portrait aspect ratio (> 1.5).
- **Posts:** Identified by Instagram CDN images (`scontent`, `cdninstagram`) larger than 150px, excluding elements already identified as Reels.

### Infinite Scroll

The extension monitors the user's scroll. When elements are hidden and the visible content becomes insufficient, it forces Instagram to load more items using synchronization techniques with the React virtualizer.

### MutationObserver

A `MutationObserver` with debounce (300ms) monitors DOM additions, automatically processing new Reels and Posts as the user navigates the feed.

---

## 🛠️ Development

### Prerequisites

- Compatible browser (Chrome, Edge, Firefox, or any Chromium-based)
- No external dependencies — the extension is 100% vanilla JavaScript/CSS

### Testing Changes

1. Make your changes to the project files.
2. Go to the browser's extensions page (`chrome://extensions`).
3. Click the **🔄 Reload** button on the extension.
4. Refresh the Instagram page (`F5` or `Ctrl+R`).

### Debugging

Open **DevTools** (`F12`) on Instagram and filter the console by the `[OcultadorDeReels]` tag to see the extension logs.

---

## 📄 License

This project is free to use. Feel free to modify and distribute.

---

## 🤝 Contributions

Contributions are welcome! If you find bugs or have suggestions:

1. Open an **Issue** describing the problem or suggestion.
2. **Fork** the project.
3. Create a **branch** for your feature (`git checkout -b my-feature`).
4. **Commit** your changes (`git commit -m 'Add my feature'`).
5. **Push** to the branch (`git push origin my-feature`).
6. Open a **Pull Request**.
