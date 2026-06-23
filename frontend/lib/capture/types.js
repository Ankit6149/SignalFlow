export const CAPTURE_PROVIDERS = {
  manual: {
    id: "manual",
    label: "Manual Upload",
    description: "Upload your own screenshots, screen recordings, logos, or documents.",
    requiresBrowserMedia: false,
    requiresServerSide: false
  },
  browser: {
    id: "browser",
    label: "Browser Screen Recorder",
    description: "Capture your screen or window directly using navigator.mediaDevices.",
    requiresBrowserMedia: true,
    requiresServerSide: false
  },
  playwright: {
    id: "playwright",
    label: "Remote Playwright Screenshot (Experimental)",
    description: "Automated headless browser screenshot of the live app URL.",
    requiresBrowserMedia: false,
    requiresServerSide: true
  }
};
