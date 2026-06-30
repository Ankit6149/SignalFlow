document.addEventListener("DOMContentLoaded", async () => {
  const tabUrlInput = document.getElementById("tab-url");
  const notesTextarea = document.getElementById("notes");
  const sendBtn = document.getElementById("send-btn");
  const openBtn = document.getElementById("open-btn");
  const studioUrlInput = document.getElementById("studio-url");
  const statusMsg = document.getElementById("status-msg");

  // Load configured destination URL
  chrome.storage.local.get(["studioUrl"], (res) => {
    if (res.studioUrl) {
      studioUrlInput.value = res.studioUrl;
    }
  });

  // Save changes to destination URL
  studioUrlInput.addEventListener("input", () => {
    const val = studioUrlInput.value.trim();
    if (val) {
      chrome.storage.local.set({ studioUrl: val });
    }
  });

  // Get active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    tabUrlInput.value = tab.url || "";
  }

  sendBtn.addEventListener("click", async () => {
    const notes = notesTextarea.value.trim();
    const url = tabUrlInput.value;
    const destStudioUrl = studioUrlInput.value.trim() || "http://localhost:3000";

    if (!notes) {
      alert("Please add notes before sending.");
      return;
    }

    try {
      chrome.runtime.sendMessage({
        action: "send_context",
        data: { url, notes, timestamp: Date.now() },
        studioUrl: destStudioUrl
      }, (response) => {
        if (response && response.success) {
          statusMsg.style.display = "block";
          notesTextarea.value = "";
          setTimeout(() => {
            statusMsg.style.display = "none";
          }, 3000);
        } else {
          alert(`Could not transfer data. Make sure SignalFlow Studio is open at: ${destStudioUrl}`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  openBtn.addEventListener("click", () => {
    const destStudioUrl = studioUrlInput.value.trim() || "http://localhost:3000";
    chrome.tabs.create({ url: destStudioUrl });
  });
});
