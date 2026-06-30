# SignalFlow Studio Extension Scaffold

This folder contains a minimal Chrome Extension scaffold that can be loaded into your browser to capture tab urls and walkthrough notes, passing them directly to the SignalFlow Studio web workspace.

## How to Install (Local Developer Mode)

1. Open **Google Chrome** (or any Chromium browser).
2. Navigate to `chrome://extensions/` by typing it into your URL bar.
3. Toggle the **Developer mode** switch in the top-right corner of the page.
4. Click on the **Load unpacked** button in the top-left.
5. Select this `extension` directory from your local filesystem.
6. The extension is now loaded! You can pin it from your extensions toolbar.

## How It Works

1. Keep SignalFlow Studio running at `http://localhost:3000`.
2. Browse to any website or documentation tab.
3. Open the extension, type a few notes about what to highlight, and click **Send**.
4. The content script bridges the note back to the active SignalFlow tab and populates a new generation draft context automatically.
