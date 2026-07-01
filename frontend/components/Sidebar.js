import React from "react";
import { Icons } from "./Icons";

export default function Sidebar({ view, setView, activeProjectName, aiStatus }) {
  // Main Top Nav items (Studio and Library only)
  const navItems = [
    { id: "create", label: "Studio", icon: (color) => <Icons.workspace size={14} color={color} /> },
    { id: "library", label: "Library", icon: (color) => <Icons.library size={14} color={color} /> }
  ];

  return (
    <header style={{ ...styles.topNav, borderBottom: "3px solid var(--ink-black)", background: "#fffdfa" }}>
      {/* Brand Logo - Left side */}
      <div style={styles.brand} onClick={() => setView("create")}>
        <div style={{
          ...styles.logoBadge,
          border: "2px solid var(--ink-black)",
          boxShadow: "2.5px 2.5px 0px var(--ink-black)"
        }}>SF</div>
        <div style={styles.brandText}>
          <span style={{ ...styles.brandName, fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: "850" }}>SignalFlow</span>
          <span style={styles.brandSub} className="handwritten">Studio</span>
        </div>
      </div>

      {/* Main Navigation - Centered */}
      <nav style={styles.navRow}>
        {navItems.map(item => {
          const isActive = view === item.id;
          const activeColor = "var(--ink-black)";
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                ...styles.navBtn,
                ...(isActive ? {
                  background: "var(--pastel-green)",
                  borderColor: "var(--ink-black)",
                  borderWidth: "2px",
                  borderStyle: "solid",
                  boxShadow: "2px 2.5px 0px var(--ink-black)",
                  fontWeight: "800",
                  color: "var(--ink-black)"
                } : {
                  border: "2px solid transparent"
                })
              }}
              className="hand-drawn-btn"
            >
              <span style={styles.navIcon}>{item.icon(activeColor)}</span>
              <span style={{ ...styles.navLabel, fontWeight: isActive ? "800" : "600" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Utilities - Right side */}
      <div style={styles.utilityRow}>
        {/* Connection status or active profile label */}
        <div style={styles.infoBadge} className="handwritten">
          <span>{activeProjectName || "Default Profile"}</span>
        </div>

        {/* Channels Configuration Trigger */}
        <button
          onClick={() => setView("channels")}
          title="Configure Outlets & Channels"
          style={{
            ...styles.utilBtn,
            background: view === "channels" ? "var(--pastel-blue)" : "transparent",
            borderColor: view === "channels" ? "var(--ink-black)" : "transparent"
          }}
          className="hand-drawn-btn"
        >
          <Icons.channels size={16} color="var(--ink-black)" />
        </button>

        {/* Settings Panel Trigger */}
        <button
          onClick={() => setView("settings")}
          title="AI Settings & API Keys"
          style={{
            ...styles.utilBtn,
            background: view === "settings" ? "var(--pastel-yellow)" : "transparent",
            borderColor: view === "settings" ? "var(--ink-black)" : "transparent"
          }}
          className="hand-drawn-btn"
        >
          <Icons.settings size={16} color="var(--ink-black)" />
        </button>

        {/* Model dot status indicator */}
        <div style={styles.engineBadge} title={`AI Provider: ${aiStatus || "None"}`}>
          <div style={styles.modelDot} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b6b6b" }}>{aiStatus || "Local Template"}</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  topNav: {
    width: "100%",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 90,
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "var(--pastel-green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ink-black)",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
  },
  brandName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--ink-black)",
    letterSpacing: "-0.3px",
    lineHeight: "1.1",
  },
  brandSub: {
    fontSize: "11px",
    color: "#6b6b6b",
    fontWeight: "500",
    marginTop: "-2px"
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "8px",
    background: "transparent",
    border: "2px solid transparent",
    color: "#6b6b6b",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
  },
  navLabel: {
    fontSize: "13px"
  },
  utilityRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoBadge: {
    fontSize: "12px",
    color: "var(--ink-black)",
    padding: "2px 8px",
    background: "var(--pastel-lavender)",
    border: "1.5px solid var(--ink-black)",
    boxShadow: "1.5px 1.5px 0px var(--ink-black)",
    borderRadius: "6px",
  },
  utilBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "2px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  engineBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px",
    background: "#fff",
    border: "1.5px solid rgba(0,0,0,0.06)",
    borderRadius: "6px"
  },
  modelDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00f5d4"
  }
};
