import React from "react";

export default function Sidebar({ view, setView, activeProjectName, aiStatus }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "create", label: "Create Package", icon: "✨" },
    { id: "library", label: "Content Library", icon: "📚" },
    { id: "projects", label: "Brand Profiles", icon: "👤" },
    { id: "channels", label: "Connected Channels", icon: "🔌" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>SF</div>
        <div>
          <h1 style={styles.brandName}>SignalFlow</h1>
          <span style={styles.brandSubtitle}>Studio v1.0</span>
        </div>
      </div>

      <div style={styles.activeBrandWidget}>
        <div style={styles.widgetLabel}>ACTIVE PROFILE</div>
        <div style={styles.widgetValue}>{activeProjectName || "No Project"}</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => {
          const isActive = view === item.id || (item.id === "create" && view === "create-flow");
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={styles.footerWidget}>
        <div style={styles.widgetLabel}>AI ENGINE</div>
        <div style={{ ...styles.widgetValue, color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={styles.statusDot}></span>
          {aiStatus || "Demo Mode"}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    background: "#121612",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    flexShrink: 0,
    height: "100vh",
    position: "sticky",
    top: 0
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    paddingLeft: "8px"
  },
  logoBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #24715d 0%, #ec6f4f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    boxShadow: "0 0 15px rgba(36, 113, 93, 0.4)"
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "0.5px"
  },
  brandSubtitle: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "500"
  },
  activeBrandWidget: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "24px"
  },
  widgetLabel: {
    fontSize: "10px",
    color: "#808f85",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "4px"
  },
  widgetValue: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flexGrow: 1
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  navButtonActive: {
    background: "#24715d",
    color: "#ffffff",
    fontWeight: "700"
  },
  navIcon: {
    fontSize: "16px",
    width: "20px"
  },
  navLabel: {
    flexGrow: 1
  },
  footerWidget: {
    marginTop: "auto",
    padding: "12px",
    background: "rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.03)",
    borderRadius: "12px"
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981"
  }
};
