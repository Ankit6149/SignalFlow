import React from "react";
import { Icons } from "./Icons";

export default function Sidebar({ view, setView, activeProjectName, aiStatus }) {
  const navItems = [
    { id: "create", label: "Studio Workspace", icon: (color) => <Icons.workspace size={16} color={color} /> },
    { id: "library", label: "Library", icon: (color) => <Icons.library size={16} color={color} /> },
    { id: "projects", label: "Profiles", icon: (color) => <Icons.profiles size={16} color={color} /> },
    { id: "channels", label: "Channels", icon: (color) => <Icons.channels size={16} color={color} /> },
    { id: "settings", label: "Settings", icon: (color) => <Icons.settings size={16} color={color} /> }
  ];

  return (
    <aside style={{ ...styles.sidebar, borderRight: "3.5px solid var(--ink-black)", background: "#fffdfa" }}>
      {/* Logo */}
      <div style={styles.brand}>
        <div style={{
          ...styles.logoBadge,
          border: "2px solid var(--ink-black)",
          boxShadow: "2px 2px 0px var(--ink-black)"
        }}>SF</div>
        <div style={styles.brandText}>
          <span style={{ ...styles.brandName, fontFamily: "'Space Grotesk', sans-serif", fontSize: "16px", fontWeight: "850" }}>SignalFlow</span>
          <span style={styles.brandSub} className="handwritten">Studio Edition</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
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
                  boxShadow: "2.5px 3px 0px var(--ink-black)",
                  fontWeight: "800",
                  color: "var(--ink-black)"
                } : {
                  border: "2px solid transparent"
                })
              }}
              className="hand-drawn-btn"
            >
              <span style={styles.navIcon}>{item.icon(activeColor)}</span>
              <span style={{ ...styles.navLabel, fontWeight: isActive ? "800" : "500" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div style={styles.bottomInfo}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Profile</span>
          <span style={styles.infoValue}>{activeProjectName || "Default"}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>AI Engine</span>
          <span style={{ ...styles.infoValue, color: "#2d6a4f" }}>
            {aiStatus || "Template"}
          </span>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    background: "#fff",
    borderRight: "1px solid rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px",
    flexShrink: 0,
    height: "100vh",
    position: "sticky",
    top: 0,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 8px",
    marginBottom: "28px",
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #2d6a4f, #52b788)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
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
    color: "#1a1a1a",
    letterSpacing: "-0.3px",
    lineHeight: "1.1",
  },
  brandSub: {
    fontSize: "11px",
    color: "#aaa",
    fontWeight: "500",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexGrow: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "transparent",
    border: "2px solid transparent",
    color: "#6b6b6b",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.15)",
    fontFamily: "inherit",
  },
  navBtnActive: {
    background: "rgba(45, 106, 79, 0.08)",
    color: "#2d6a4f",
    fontWeight: "600",
  },
  navIcon: {
    fontSize: "15px",
    width: "20px",
    textAlign: "center",
    flexShrink: 0,
  },
  navLabel: {
    flexGrow: 1,
  },
  bottomInfo: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "#faf9f6",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: "10px",
    color: "#aaa",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1a1a1a",
    maxWidth: "110px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
