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
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div>
            <div style={styles.statLabel}>Total Packages</div>
            <div style={styles.statValue}>{packages.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><span style={{ color: "#818cf8" }}>🔌</span></div>
          <div>
            <div style={styles.statLabel}>Connected Accounts</div>
            <div style={styles.statValue}>{connectedCount}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><span style={{ color: "#10b981" }}>📅</span></div>
          <div>
            <div style={styles.statLabel}>Scheduled Posts</div>
            <div style={styles.statValue}>{activeScheduled.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><span style={{ color: "#f43f5e" }}>⚠️</span></div>
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
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Quick Actions</h3>
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
                  style={styles.actionBtn}
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
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Packages</h3>
              <button onClick={() => setView("library")} style={styles.textLink}>View All</button>
            </div>
            {recentPackages.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No content packages created yet.</p>
                <button onClick={() => { setCreationSource("manual"); setView("create"); }} style={styles.primaryBtn}>
                  Create Your First Package
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {recentPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg)}
                    style={styles.listItem}
                  >
                    <div style={styles.pkgInfo}>
                      <span style={styles.pkgTitle}>{pkg.title || "Untitled Package"}</span>
                      <span style={styles.pkgMeta}>
                        Source: {pkg.sourceType} • Updated {new Date(pkg.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(pkg.status)
                    }}>
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
            <div style={{ ...styles.card, background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)" }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Brand Profile: {activeProject.name}</h3>
                <button onClick={() => setView("projects")} style={styles.textLink}>Edit</button>
              </div>
              <p style={styles.brandDesc}>{activeProject.description}</p>
              <div style={styles.brandMetrics}>
                <div>
                  <span style={styles.metricLabel}>Audience</span>
                  <span style={styles.metricVal}>{activeProject.audience}</span>
                </div>
                <div>
                  <span style={styles.metricLabel}>Voice</span>
                  <span style={styles.metricVal}>{activeProject.brandVoice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Posts */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Scheduled Publishing Queue</h3>
            {activeScheduled.length === 0 ? (
              <div style={styles.emptyQueue}>
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
      return { background: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
    case "scheduled":
      return { background: "rgba(236, 111, 79, 0.12)", color: "#ec6f4f" };
    case "ready":
      return { background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" };
    case "failed":
      return { background: "rgba(244, 63, 94, 0.15)", color: "#f43f5e" };
    default:
      return { background: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" };
  }
}

const styles = {
  container: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflowY: "auto",
    flexGrow: 1
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  subtitle: {
    fontSize: "14px",
    color: "#59635c",
    margin: "4px 0 0 0"
  },
  projectSelector: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  selectorLabel: {
    fontSize: "11px",
    color: "#59635c",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },
  select: {
    background: "#ffffff",
    color: "#121612",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    padding: "8px 16px",
    borderRadius: "8px",
    outline: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px"
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  statIcon: {
    fontSize: "28px",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(36, 113, 93, 0.06)",
    color: "#24715d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  statLabel: {
    fontSize: "12px",
    color: "#59635c",
    fontWeight: "600",
    marginBottom: "4px"
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#121612"
  },
  dashboardBody: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "24px",
    alignItems: "start"
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#121612",
    margin: 0
  },
  textLink: {
    background: "transparent",
    border: "none",
    color: "#ec6f4f",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    padding: 0
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "rgba(36, 113, 93, 0.04)",
    border: "1px solid rgba(18, 22, 18, 0.05)",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease"
  },
  actionIcon: {
    fontSize: "22px"
  },
  actionDetails: {
    display: "flex",
    flexDirection: "column"
  },
  actionLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#121612"
  },
  actionDesc: {
    fontSize: "11px",
    color: "#59635c",
    marginTop: "2px"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    textAlign: "center",
    color: "#59635c",
    gap: "12px"
  },
  primaryBtn: {
    background: "#24715d",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "rgba(18, 22, 18, 0.02)",
    border: "1px solid rgba(18, 22, 18, 0.04)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  listItemNoHover: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "rgba(18, 22, 18, 0.02)",
    border: "1px solid rgba(18, 22, 18, 0.04)",
    borderRadius: "12px"
  },
  pkgInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  pkgTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#121612"
  },
  pkgMeta: {
    fontSize: "11px",
    color: "#59635c"
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase"
  },
  brandDesc: {
    fontSize: "14px",
    color: "#59635c",
    lineHeight: "1.5",
    margin: 0
  },
  brandMetrics: {
    display: "flex",
    gap: "24px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "16px"
  },
  metricLabel: {
    fontSize: "11px",
    color: "#59635c",
    display: "block",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "4px"
  },
  metricVal: {
    fontSize: "13px",
    color: "#121612",
    fontWeight: "600"
  },
  emptyQueue: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
    textAlign: "center",
    background: "rgba(18, 22, 18, 0.02)",
    borderRadius: "12px"
  },
  emptyQueueIcon: {
    fontSize: "24px",
    marginBottom: "8px"
  },
  emptyQueueText: {
    fontSize: "13px",
    color: "#59635c",
    margin: 0
  },
  queueItemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%"
  },
  queueHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  queueChannel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#121612"
  },
  queueTime: {
    fontSize: "11px",
    color: "#ec6f4f",
    fontWeight: "600"
  },
  queueSnippet: {
    fontSize: "12px",
    color: "#59635c",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  failedItem: {
    padding: "12px",
    background: "rgba(244, 63, 94, 0.03)",
    border: "1px solid rgba(244, 63, 94, 0.1)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  failedHeader: {
    display: "flex",
    justifyContent: "space-between"
  },
  failedChannel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#f43f5e"
  },
  failedError: {
    fontSize: "11px",
    color: "#59635c",
    textAlign: "right"
  },
  retryBtn: {
    alignSelf: "flex-end",
    background: "transparent",
    border: "1px solid #f43f5e",
    color: "#f43f5e",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer"
  }
};
