/**
 * Chrome Extension Background Worker.
 * Communicates with SignalFlow Studio tabs at localhost.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "send_context") {
    // Find all tabs loaded with localhost:3000
    chrome.tabs.query({ url: "*://localhost:3000/*" }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "SignalFlow Studio is not open on localhost:3000" });
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
