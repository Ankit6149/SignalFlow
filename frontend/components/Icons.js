import React from "react";

// Helper for consistent styling
const svgStyle = (size = 18, color = "currentColor") => ({
  width: `${size}px`,
  height: `${size}px`,
  fill: "none",
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  verticalAlign: "middle",
  display: "inline-block"
});

export const Icons = {
  // Sidebar Nav Icons
  workspace: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  library: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5L4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
    </svg>
  ),
  profiles: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  channels: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
    </svg>
  ),
  settings: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  // Source Type Icons
  manual: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  notes: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  url: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  record: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
    </svg>
  ),
  screenshot: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  repo: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" transform="rotate(15 12 12)" />
    </svg>
  ),

  // Platform/Channel Logos (Clean SVGs)
  linkedin: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={{ width: `${size}px`, height: `${size}px`, fill: color, display: "inline-block", verticalAlign: "middle" }}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  x: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={{ width: `${size}px`, height: `${size}px`, fill: color, display: "inline-block", verticalAlign: "middle" }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  reddit: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M17 11.5a1.5 1.5 0 0 1-2.5 1.1 6.3 6.3 0 0 0-5 0A1.5 1.5 0 1 1 7 11.5c0-.4.2-.8.5-1.1A8.2 8.2 0 0 1 12 9a8.2 8.2 0 0 1 4.5 1.4c.3-.3.5-.7.5-1.1z" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M10 16a3 3 0 0 0 4 0" />
    </svg>
  ),
  hn: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={{ width: `${size}px`, height: `${size}px`, fill: "none", stroke: color, strokeWidth: 2, display: "inline-block", verticalAlign: "middle" }}>
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M8 7l4 6 4-6M12 13v5" />
    </svg>
  ),
  blog: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  newsletter: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  release_notes: ({ size = 18, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14h6M9 18h6M10 10h4" />
    </svg>
  ),

  // Miscellaneous Landing icons
  security: ({ size = 24, color = "#2d6a4f" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  database: ({ size = 24, color = "#2d6a4f" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  key: ({ size = 24, color = "#2d6a4f" }) => (
    <svg viewBox="0 0 24 24" style={svgStyle(size, color)}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l-2-2" />
    </svg>
  ),
  star: ({ size = 16, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={{ width: `${size}px`, height: `${size}px`, fill: color, stroke: color, strokeWidth: 2, display: "inline-block", verticalAlign: "middle" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  sparkle: ({ size = 16, color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" style={{ width: `${size}px`, height: `${size}px`, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )
};
