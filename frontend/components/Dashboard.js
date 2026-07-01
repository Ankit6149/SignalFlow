import React from "react";
import { CHANNELS } from "../lib/config";

export default function Dashboard({
  projects,
  activeProjectId,
  packages,
  scheduledPosts,
  connectedChannels,
  aiSettings,
  setView,
  setActiveProjectId,
  onSelectPackage,
  setCreationSource,
  accessLocked = false,
  publicHosted = false,
  isOwnerAuthenticated = false
}) {
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const recentPackages = [...packages]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const drafts = packages.filter(p => p.status === "draft");
  
  // Group scheduled posts
  const activeScheduled = scheduledPosts.filter(p => p.status === "scheduled");
  const failedPosts = scheduledPosts.filter(p => p.status === "failed");

  // Get connected channels count
  const connectedCount = Object.values(connectedChannels).filter(c => c.connected).length;

  const quickActions = [
    { label: "New Package", icon: "✨", desc: "Create content package", source: "manual", view: "create" },
    { label: "Record Walkthrough", icon: "🎥", desc: "Browser-native screen capture", source: "record", view: "create" },
    { label: "Paste App URL", icon: "🔗", desc: "Analyze links for content", source: "url", view: "create" },
    { label: "Configure Channels", icon: "🔌", desc: "Manage Oauth integrations", view: "channels" }
  ];

  // Hosted Mode Banner Definitions
  let bannerText = "";
  let bannerTitle = "";
  let bannerColor = "rgba(148, 163, 184, 0.1)";
  let bannerBorder = "rgba(148, 163, 184, 0.25)";
  let bannerIcon = "💻";
  let bannerTextColor = "#94a3b8";

  if (publicHosted && !isOwnerAuthenticated) {
    bannerTitle = "Public demo mode";
    bannerText = "Use demo/template generation or self-host SignalFlow to connect your own keys and channels.";
    bannerColor = "rgba(245, 158, 11, 0.06)";
    bannerBorder = "rgba(245, 158, 11, 0.2)";
    bannerIcon = "🌐";
    bannerTextColor = "#b45309";
  } else if (accessLocked && !isOwnerAuthenticated) {
    bannerTitle = "Private hosted workspace";
    bannerText = "Owner model and social connections are hidden. Enter the owner access key to use protected generation and channel routes.";
    bannerColor = "rgba(239, 68, 68, 0.06)";
    bannerBorder = "rgba(239, 68, 68, 0.2)";
    bannerIcon = "🔒";
    bannerTextColor = "#b91c1c";
  } else if (accessLocked && isOwnerAuthenticated) {
    bannerTitle = "Owner session active";
    bannerText = "Protected generation and connected-channel status are available in this browser session.";
    bannerColor = "rgba(36, 113, 93, 0.08)";
    bannerBorder = "rgba(36, 113, 93, 0.25)";
    bannerIcon = "🔑";
    bannerTextColor = "#24715d";
  } else {
    bannerTitle = "Local-first mode";
    bannerText = "Your projects, package drafts, and cached keys stay in this browser unless you export or connect services.";
    bannerColor = "rgba(16, 185, 129, 0.06)";
    bannerBorder = "rgba(16, 185, 129, 0.2)";
    bannerIcon = "💻";
    bannerTextColor = "#15803d";
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Workspace Dashboard</h2>
          <p style={styles.subtitle}>Welcome to your content production center.</p>
        </div>
        
        {projects.length > 0 && (
          <div style={styles.projectSelector}>
            <label style={styles.selectorLabel}>Active Brand Profile:</label>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              style={styles.select}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Dynamic Workspace State Banner */}
      <div style={{
        background: bannerColor,
        border: `1px solid ${bannerBorder}`,
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      }}>
        <span style={{ fontSize: "24px" }}>{bannerIcon}</span>
        <div>
          <h4 style={{ margin: 0, color: bannerTextColor, fontSize: "14px", fontWeight: "700" }}>{bannerTitle}</h4>
          <p style={{ margin: "4px 0 0 0", color: "#59635c", fontSize: "13px", lineHeight: "1.5" }}>{bannerText}</p>
        </div>
      </div>

      {/* Grid of stats */}
      <section style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: "var(--pastel-yellow)" }} className="hand-drawn offset-border neo-shadow">
          <div style={styles.statIcon}>📦</div>
          <div>
            <div style={styles.statLabel}>Total Packages</div>
            <div style={styles.statValue}>{packages.length}</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, background: "var(--pastel-blue)" }} className="hand-drawn offset-border neo-shadow">
          <div style={styles.statIcon}><span style={{ color: "var(--ink-black)" }}>🔌</span></div>
          <div>
            <div style={styles.statLabel}>Connected Accounts</div>
            <div style={styles.statValue}>{connectedCount}</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, background: "var(--pastel-green)" }} className="hand-drawn offset-border neo-shadow">
          <div style={styles.statIcon}><span style={{ color: "var(--ink-black)" }}>📅</span></div>
          <div>
            <div style={styles.statLabel}>Scheduled Posts</div>
            <div style={styles.statValue}>{activeScheduled.length}</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, background: "var(--pastel-red)" }} className="hand-drawn offset-border neo-shadow">
          <div style={styles.statIcon}><span style={{ color: "var(--ink-black)" }}>⚠️</span></div>
          <div>
            <div style={styles.statLabel}>Action Required</div>
            <div style={styles.statValue}>{failedPosts.length}</div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div style={styles.dashboardBody}>
        {/* Left Column: Quick Actions + Recents */}
        <div style={styles.leftCol}>
          {/* Quick Actions */}
          <div style={styles.card} className="hand-drawn offset-border neo-shadow">
            <h3 style={styles.cardTitle} className="handwritten">⚡ Quick Actions</h3>
            <div style={styles.actionGrid}>
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (act.source) {
                      setCreationSource(act.source);
                    }
                    setView(act.view);
                  }}
                  style={{ ...styles.actionBtn, border: "2px solid var(--ink-black)" }}
                  className="hand-drawn-btn"
                >
                  <span style={styles.actionIcon}>{act.icon}</span>
                  <div style={styles.actionDetails}>
                    <span style={styles.actionLabel}>{act.label}</span>
                    <span style={styles.actionDesc}>{act.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Packages */}
          <div style={styles.card} className="hand-drawn offset-border neo-shadow">
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle} className="handwritten"> Recent Packages</h3>
              <button onClick={() => setView("library")} style={styles.textLink} className="handwritten">View All ➜</button>
            </div>
            {recentPackages.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No content packages created yet.</p>
                <button onClick={() => { setCreationSource("manual"); setView("create"); }} style={styles.primaryBtn} className="hand-drawn-btn-wavy">
                  Create Your First Package
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {recentPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg)}
                    style={{ ...styles.listItem, border: "2px solid var(--ink-black)", borderRadius: "10px", marginBottom: "4px" }}
                    className="hand-drawn-wavy"
                  >
                    <div style={styles.pkgInfo}>
                      <span style={styles.pkgTitle}>{pkg.title || "Untitled Package"}</span>
                      <span style={styles.pkgMeta}>
                        Source: {pkg.sourceType} • Updated {new Date(pkg.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(pkg.status),
                      border: "1.5px solid var(--ink-black)",
                      color: "var(--ink-black)"
                    }} className="hand-drawn">
                      {pkg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Queues and Channels */}
        <div style={styles.rightCol}>
          {/* Brand Quick Peek */}
          {activeProject && (
            <div style={{ ...styles.card, background: "var(--pastel-lavender)", color: "var(--ink-black)" }} className="hand-drawn offset-border neo-shadow">
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle} className="handwritten">👤 Brand Profile: {activeProject.name}</h3>
                <button onClick={() => setView("projects")} style={styles.textLink} className="handwritten">Edit ➜</button>
              </div>
              <p style={{ ...styles.brandDesc, color: "var(--ink-black)" }}>{activeProject.description}</p>
              <div style={{ ...styles.brandMetrics, borderTop: "2px solid var(--ink-black)" }}>
                <div>
                  <span style={{ ...styles.metricLabel, color: "rgba(18, 22, 18, 0.6)" }}>Audience</span>
                  <span style={styles.metricVal}>{activeProject.audience || "General"}</span>
                </div>
                <div>
                  <span style={{ ...styles.metricLabel, color: "rgba(18, 22, 18, 0.6)" }}>Voice</span>
                  <span style={styles.metricVal}>{activeProject.brandVoice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Posts */}
          <div style={styles.card} className="hand-drawn offset-border neo-shadow">
            <h3 style={styles.cardTitle} className="handwritten">📅 Scheduled Queue</h3>
            {activeScheduled.length === 0 ? (
              <div style={{ ...styles.emptyQueue, border: "2px solid var(--ink-black)" }} className="hand-drawn-wavy">
                <span style={styles.emptyQueueIcon}>📅</span>
                <p style={styles.emptyQueueText}>No posts scheduled for publishing.</p>
              </div>
            ) : (
              <div style={styles.list}>
                {activeScheduled.map(post => {
                  const channelInfo = CHANNELS.find(([key]) => key === post.platform);
                  const channelLabel = channelInfo ? channelInfo[1] : post.platform;
                  const channelEmoji = channelInfo ? channelInfo[2] : "🔌";
                  return (
                    <div key={post.id} style={styles.listItemNoHover}>
                      <div style={styles.queueItemInfo}>
                        <div style={styles.queueHeader}>
                          <span style={styles.queueChannel}>{channelEmoji} {channelLabel}</span>
                          <span style={styles.queueTime}>
                            {new Date(post.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                        <p style={styles.queueSnippet}>{post.contentSnippet}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Failed Posts / Required Action */}
          {failedPosts.length > 0 && (
            <div style={{ ...styles.card, border: "1px solid rgba(244, 63, 94, 0.2)" }}>
              <h3 style={{ ...styles.cardTitle, color: "#f43f5e" }}>⚠️ Failed Deliveries</h3>
              <div style={styles.list}>
                {failedPosts.map(post => (
                  <div key={post.id} style={styles.failedItem}>
                    <div style={styles.failedHeader}>
                      <span style={styles.failedChannel}>{post.platform.toUpperCase()}</span>
                      <span style={styles.failedError}>{post.error || "Unknown network error"}</span>
                    </div>
                    <button
                      onClick={() => setView("library")}
                      style={styles.retryBtn}
                    >
                      Fix and Republish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "posted":
      return { background: "rgba(45, 106, 79, 0.1)", color: "#2d6a4f" };
    case "scheduled":
      return { background: "rgba(245, 158, 11, 0.1)", color: "#d97706" };
    case "ready":
      return { background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
    case "failed":
      return { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
    default:
      return { background: "rgba(0,0,0,0.05)", color: "#888" };
  }
}

const styles = {
  container: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto",
    flexGrow: 1,
    animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "4px 0 0 0",
  },
  projectSelector: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  selectorLabel: {
    fontSize: "10px",
    color: "#aaa",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  select: {
    background: "#fff",
    color: "#1a1a1a",
    border: "1px solid rgba(0,0,0,0.1)",
    padding: "8px 14px",
    borderRadius: "8px",
    outline: "none",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    padding: "18px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  statIcon: {
    fontSize: "22px",
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "rgba(45, 106, 79, 0.06)",
    color: "#2d6a4f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "600",
    marginBottom: "2px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  dashboardBody: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "20px",
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "14px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "box-shadow 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
  },
  textLink: {
    background: "transparent",
    border: "none",
    color: "#2d6a4f",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    padding: 0,
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    background: "#faf9f6",
    border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  actionIcon: {
    fontSize: "20px",
  },
  actionDetails: {
    display: "flex",
    flexDirection: "column",
  },
  actionLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionDesc: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "36px 20px",
    textAlign: "center",
    color: "#999",
    gap: "12px",
  },
  primaryBtn: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#faf9f6",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  listItemNoHover: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#faf9f6",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: "10px",
  },
  pkgInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  pkgTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  pkgMeta: {
    fontSize: "11px",
    color: "#999",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  brandDesc: {
    fontSize: "13px",
    color: "#888",
    lineHeight: "1.6",
    margin: 0,
  },
  brandMetrics: {
    display: "flex",
    gap: "24px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    paddingTop: "14px",
  },
  metricLabel: {
    fontSize: "10px",
    color: "#aaa",
    display: "block",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  metricVal: {
    fontSize: "13px",
    color: "#1a1a1a",
    fontWeight: "600",
  },
  emptyQueue: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    textAlign: "center",
    background: "#faf9f6",
    borderRadius: "10px",
  },
  emptyQueueIcon: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  emptyQueueText: {
    fontSize: "13px",
    color: "#999",
    margin: 0,
  },
  queueItemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
  },
  queueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queueChannel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  queueTime: {
    fontSize: "11px",
    color: "#2d6a4f",
    fontWeight: "600",
  },
  queueSnippet: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  failedItem: {
    padding: "12px",
    background: "rgba(239, 68, 68, 0.03)",
    border: "1px solid rgba(239, 68, 68, 0.1)",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  failedHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  failedChannel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#ef4444",
  },
  failedError: {
    fontSize: "11px",
    color: "#888",
    textAlign: "right",
  },
  retryBtn: {
    alignSelf: "flex-end",
    background: "transparent",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
