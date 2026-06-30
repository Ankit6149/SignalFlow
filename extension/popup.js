document.addEventListener("DOMContentLoaded", async () => {
  const tabUrlInput = document.getElementById("tab-url");
  const notesTextarea = document.getElementById("notes");
  const sendBtn = document.getElementById("send-btn");
  const openBtn = document.getElementById("open-btn");
  const statusMsg = document.getElementById("status-msg");

  // Get active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    tabUrlInput.value = tab.url || "";
  }

  sendBtn.addEventListener("click", async () => {
    const notes = notesTextarea.value.trim();
    const url = tabUrlInput.value;

    if (!notes) {
      alert("Please add notes before sending.");
      return;
    }

    try {
      // Send message to background worker or directly to local storage / localhost app
      // Communication utilizes custom window dispatching when user keeps SignalFlow page open
      chrome.runtime.sendMessage({
        action: "send_context",
        data: { url, notes, timestamp: Date.now() }
      }, (response) => {
        if (response && response.success) {
          statusMsg.style.display = "block";
          notesTextarea.value = "";
          setTimeout(() => {
            statusMsg.style.display = "none";
          }, 3000);
        } else {
          alert("Could not transfer data. Make sure SignalFlow Studio (http://localhost:3000) is open.");
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  openBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });
});
