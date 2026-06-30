/**
 * Chrome Extension Background Worker.
 * Communicates with SignalFlow Studio tabs at localhost.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "send_context") {
    // Generate dynamic match pattern from the configured destination URL
    let matchPattern = "*://localhost:3000/*";
    try {
      const parsed = new URL(message.studioUrl || "http://localhost:3000");
      matchPattern = `*://${parsed.hostname}${parsed.port ? ":" + parsed.port : ""}/*`;
    } catch (e) {
      console.error("Invalid URL format:", e);
    }

    // Find all tabs loaded with target studio URL
    chrome.tabs.query({ url: matchPattern }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: `SignalFlow Studio is not open at: ${message.studioUrl}` });
        return;
      }

      // Handoff data via tabs message passing
      let dispatchedCount = 0;
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: "INGEST_EXTENSION_CONTEXT",
          data: message.data
        }, (res) => {
          dispatchedCount++;
          if (dispatchedCount === tabs.length) {
            sendResponse({ success: true });
          }
        });
      });
    });

    return true; // async reply
  }
});
