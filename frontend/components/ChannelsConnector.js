import React, { useState } from "react";
import { CHANNELS } from "../lib/config";

export default function ChannelsConnector({
  connectedChannels,
  onConnectPlatform,
  onDisconnectPlatform,
  postingLogs = [],
  accessLocked = false,
  publicHosted = false,
  isOwnerAuthenticated = false
}) {
  const [activeLog, setActiveLog] = useState(null);

  // Group channels into OAuth vs Manual-only
  const oauthChannels = CHANNELS.filter(([key]) => ["linkedin", "x", "reddit"].includes(key));
  const manualChannels = CHANNELS.filter(([key]) => !["linkedin", "x", "reddit"].includes(key));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Connected Social Channels</h2>
          <p style={styles.subtitle}>Link target platforms via official secure API endpoints or check instructions for manual channels.</p>
        </div>
      </header>

      {/* Grid of OAuth Accounts */}
      <h3 style={styles.sectionTitle}>🔗 Direct API Channels (Secure OAuth)</h3>
      <div style={styles.grid}>
        {oauthChannels.map(([key, label, emoji, color]) => {
          const status = connectedChannels[key] || { connected: false };
          const isConnected = status.connected;
          
          return (
            <div
              key={key}
              style={{
                ...styles.card,
                background: isConnected ? "var(--pastel-green)" : "#fff",
                padding: "24px"
              }}
              className="hand-drawn offset-border neo-shadow"
            >
              <div style={styles.cardHeader}>
                <div style={styles.platformMeta}>
                  <span style={{ ...styles.platformIcon, background: color }}>{emoji}</span>
                  <div>
                    <h4 style={styles.platformLabel}>{label}</h4>
                    <span style={styles.badgeApi} className="hand-drawn">API Connection</span>
                  </div>
                </div>
                
                {accessLocked && !isOwnerAuthenticated ? (
                  <span style={{ ...styles.statusBadge, background: "rgba(148, 163, 184, 0.15)", color: "#cbd5e1" }}>
                    Protected
                  </span>
                ) : (
                  <span style={{
                    ...styles.statusBadge,
                    background: isConnected ? "var(--pastel-green-border)" : "var(--pastel-red-border)",
                    color: "var(--ink-black)",
                    border: "1.5px solid var(--ink-black)"
                  }} className="hand-drawn">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                )}
              </div>

              <div style={styles.cardBody}>
                {accessLocked && !isOwnerAuthenticated ? (
                  <p style={styles.desc}>Connected owner channels are hidden on this hosted workspace.</p>
                ) : isConnected ? (
                  <div style={styles.profileDetails}>
                    <p style={styles.desc}>Linked to profile: <strong>{status.profile?.name || status.profile?.username || "Active Member"}</strong></p>
                    <p style={styles.metaText}>Authorized: {new Date(status.connectedAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p style={styles.desc}>Publish posts directly from the editor using secure platform authentication.</p>
                )}
              </div>

              <div style={styles.cardFooter}>
                {accessLocked && !isOwnerAuthenticated ? (
                  <span style={styles.manualActionText}>🔒 Owner credentials hidden</span>
                ) : isConnected ? (
                  <button
                    onClick={() => onDisconnectPlatform(key)}
                    style={{ ...styles.disconnectBtn, width: "100%" }}
                    className="hand-drawn-btn"
                  >
                    Disconnect Profile
                  </button>
                ) : (
                  <button
                    onClick={() => onConnectPlatform(key)}
                    style={{ ...styles.connectBtn, width: "100%" }}
                    className="hand-drawn-btn-wavy"
                  >
                    Link Account
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of Manual-only Accounts */}
      <h3 style={styles.sectionTitle}>📝 Manual/Export Channels (Fallback Guidelines)</h3>
      <div style={styles.grid}>
        {manualChannels.map(([key, label, emoji, color]) => {
          return (
            <div
              key={key}
              style={{
                ...styles.cardManual,
                background: "var(--pastel-yellow)",
                padding: "24px"
              }}
              className="hand-drawn-wavy offset-border neo-shadow"
            >
              <div style={styles.cardHeader}>
                <div style={styles.platformMeta}>
                  <span style={{ ...styles.platformIcon, background: color }}>{emoji}</span>
                  <div>
                    <h4 style={styles.platformLabel}>{label}</h4>
                    <span style={styles.badgeManual} className="hand-drawn">Handoff / Copy</span>
                  </div>
                </div>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.desc}>
                  {key === "instagram" && "Requires Meta Business Account to publish via API. Use manual preview-copy flow."}
                  {key === "hn" && "Hacker News has no open write APIs. Content is optimized for objective HN threads."}
                  {key === "blog" && "Export Markdown file drafts directly into your static site builder or headless CMS."}
                  {key === "newsletter" && "Copy generated text into Buttondown, Substack, Mailchimp or ConvertKit."}
                  {key === "release_notes" && "Compiled into clean lists structure to paste on GitHub releases."}
                </p>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.manualActionText} className="handwritten">✏️ Copy & Export Supported</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Posting Logs Calendar List */}
      <h3 style={styles.sectionTitle}>📜 Social Publishing Logs</h3>
      {postingLogs.length === 0 ? (
        <div style={styles.emptyLogs}>
          <span>📜</span>
          <p>No posts published or logged yet.</p>
        </div>
      ) : (
        <div style={styles.logsTable}>
          <div style={styles.tableHeader}>
            <span style={styles.th}>Platform</span>
            <span style={styles.th}>Content Snippet</span>
            <span style={styles.th}>Connector Status</span>
            <span style={styles.th}>Timestamp</span>
            <span style={styles.th}>Actions</span>
          </div>
          <div style={styles.tableBody}>
            {postingLogs.map((log) => {
              const channelInfo = CHANNELS.find(([key]) => key === log.platform);
              const label = channelInfo ? channelInfo[1] : log.platform;
              const emoji = channelInfo ? channelInfo[2] : "🔌";
              
              return (
                <div
                  key={log.id}
                  style={{
                    ...styles.tableRow,
                    background: "#fff",
                    border: "2px solid var(--ink-black)",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    boxShadow: "2.5px 3px 0px var(--ink-black)",
                    cursor: "pointer"
                  }}
                  className="hand-drawn-wavy"
                  onClick={() => setActiveLog(log)}
                >
                  <span style={styles.td}><strong>{emoji} {label}</strong></span>
                  <span style={styles.tdSnippet}>{log.contentSnippet}</span>
                  <span style={styles.td}>
                    <span style={{
                      ...styles.logBadge,
                      background: log.status === "posted" ? "var(--pastel-green-border)" : "var(--pastel-red-border)",
                      color: "var(--ink-black)",
                      border: "1.5px solid var(--ink-black)"
                    }} className="hand-drawn">
                      {log.status === "posted" 
                        ? (log.postUrl ? "SUCCESS" : (log.connectorType === "Simulated Scheduler Runner" ? "SIMULATED" : "MOCK POST")) 
                        : "FAILED"
                      }
                    </span>
                  </span>
                  <span style={styles.td}>{new Date(log.timestamp).toLocaleString()}</span>
                  <span style={styles.td}>
                    {log.postUrl ? (
                      <a href={log.postUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={styles.logLink} className="handwritten">
                        View Live 🔗
                      </a>
                    ) : (
                      <span style={styles.simulatedText} className="handwritten">Demo connector</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {activeLog && (
        <div style={styles.modalOverlay} onClick={() => setActiveLog(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveLog(null)} style={styles.closeBtn}>✕ Close</button>
            <h3 style={styles.modalTitle}>Social Dispatch Details</h3>
            
            <div style={styles.modalMetaGrid}>
              <div>
                <strong>Platform:</strong> {activeLog.platform.toUpperCase()}
              </div>
              <div>
                <strong>Status:</strong> {activeLog.postUrl ? activeLog.status.toUpperCase() : "SIMULATED / MOCK POST"}
              </div>
              <div>
                <strong>Connector:</strong> {activeLog.postUrl ? (activeLog.connectorType || "Official API") : "Demo connector"}
              </div>
              <div>
                <strong>Published:</strong> {new Date(activeLog.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={styles.logBodyBox}>
              <h4 style={styles.logSectionHeader}>Dispatched Post Body:</h4>
              <pre style={styles.logContent}>{activeLog.content}</pre>
            </div>
            
            {activeLog.error && (
              <div style={styles.errorAlert}>
                <strong>Error Log details:</strong>
                <p>{activeLog.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
    alignItems: "center"
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
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#121612",
    margin: "12px 0 0 0",
    borderBottom: "1px solid rgba(18, 22, 18, 0.08)",
    paddingBottom: "10px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  cardManual: {
    background: "rgba(18, 22, 18, 0.01)",
    border: "1px solid rgba(18, 22, 18, 0.05)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start"
  },
  platformMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  platformIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#fff"
  },
  platformLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612",
    margin: 0
  },
  badgeApi: {
    fontSize: "10px",
    color: "#ec6f4f",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  badgeManual: {
    fontSize: "10px",
    color: "#59635c",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px"
  },
  cardBody: {
    fontSize: "13px",
    color: "#59635c",
    lineHeight: "1.5"
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  desc: {
    margin: 0
  },
  metaText: {
    margin: 0,
    fontSize: "11px",
    color: "#808f85"
  },
  cardFooter: {
    marginTop: "auto"
  },
  connectBtn: {
    width: "100%",
    background: "#24715d",
    color: "#ffffff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  disconnectBtn: {
    width: "100%",
    background: "rgba(244, 63, 94, 0.06)",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    color: "#e11d48",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  manualActionText: {
    fontSize: "12px",
    color: "#808f85",
    fontWeight: "600"
  },
  emptyLogs: {
    background: "#ffffff",
    border: "1px dashed rgba(18, 22, 18, 0.15)",
    borderRadius: "16px",
    padding: "40px 20px",
    textAlign: "center",
    color: "#59635c",
    fontSize: "14px"
  },
  logsTable: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "14px",
    overflow: "hidden"
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 120px 180px 120px",
    background: "rgba(18, 22, 18, 0.03)",
    padding: "12px 20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#121612"
  },
  th: {
    textAlign: "left"
  },
  tableBody: {
    display: "flex",
    flexDirection: "column"
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 120px 180px 120px",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(18, 22, 18, 0.04)",
    fontSize: "13px",
    color: "#121612",
    alignItems: "center",
    cursor: "pointer",
    background: "transparent",
    transition: "background 0.2s ease"
  },
  td: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  tdSnippet: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#59635c",
    paddingRight: "16px"
  },
  logBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px"
  },
  logLink: {
    color: "#ec6f4f",
    fontWeight: "600"
  },
  simulatedText: {
    color: "#808f85",
    fontSize: "12px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(18, 22, 18, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "20px"
  },
  modalContent: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    padding: "28px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 24px 60px rgba(18, 22, 18, 0.1)"
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(18, 22, 18, 0.05)",
    border: "none",
    borderRadius: "8px",
    color: "#121612",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  modalMetaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    background: "rgba(18, 22, 18, 0.02)",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid rgba(18, 22, 18, 0.05)",
    fontSize: "13px",
    color: "#59635c"
  },
  logBodyBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  logSectionHeader: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612",
    margin: 0
  },
  logContent: {
    background: "rgba(18, 22, 18, 0.02)",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid rgba(18, 22, 18, 0.06)",
    color: "#121612",
    overflowX: "auto",
    maxHeight: "220px",
    whiteSpace: "pre-wrap"
  },
  errorAlert: {
    padding: "12px",
    background: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    color: "#f43f5e",
    borderRadius: "8px",
    fontSize: "13px"
  }
};
