/**
 * Chrome Extension Content script.
 * Listens for background worker context passes and forwards them to the Next.js page.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "INGEST_EXTENSION_CONTEXT") {
    // Dispatch a custom event on the window object
    const event = new CustomEvent("SignalFlowIngestContext", {
      detail: message.data
    });
    window.dispatchEvent(event);
    
    sendResponse({ success: true });
  }
});
