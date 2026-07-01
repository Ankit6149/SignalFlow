import React, { useState } from "react";
import { CHANNELS } from "../lib/config";
import PlatformPreviews from "./PlatformPreviews";
import { Icons } from "./Icons";

export default function ContentLibrary({
  projects,
  packages,
  onSavePackage,
  onDeletePackage,
  onSchedulePost,
  setView,
  onSaveProject,
  onDeleteProject,
  onSelectActiveProject,
  activeProjectId
}) {
  // View modes: "folders" (default) or "packages" (inside a folder)
  const [viewMode, setViewMode] = useState("folders");
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedPkg, setSelectedPkg] = useState(null);

  // Scheduling modal
  const [schedulingPkg, setSchedulingPkg] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [schedulePlatforms, setSchedulePlatforms] = useState([]);

  const getCardBg = (id) => {
    const bgs = ["var(--pastel-green)", "var(--pastel-yellow)", "var(--pastel-blue)", "var(--pastel-lavender)", "var(--pastel-red)", "var(--pastel-orange)"];
    const codeSum = (id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return bgs[codeSum % bgs.length];
  };

  // Count packages per folder
  function getPackageCount(projectId) {
    return packages.filter(p => p.projectId === projectId).length;
  }

  function getLastUpdated(projectId) {
    const folderPkgs = packages.filter(p => p.projectId === projectId);
    if (folderPkgs.length === 0) return null;
    const dates = folderPkgs.map(p => new Date(p.updatedAt || p.createdAt));
    const latest = new Date(Math.max(...dates));
    return latest.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function openFolder(projectId) {
    setActiveFolderId(projectId);
    setViewMode("packages");
    setSearch("");
  }

  function goBackToFolders() {
    setViewMode("folders");
    setActiveFolderId(null);
    setSearch("");
  }

  const activeFolder = projects.find(p => p.id === activeFolderId);
  const folderPackages = packages
    .filter(p => p.projectId === activeFolderId)
    .filter(p => {
      if (!search) return true;
      return p.title?.toLowerCase().includes(search.toLowerCase()) ||
             p.sourceText?.toLowerCase().includes(search.toLowerCase());
    });

  function handleDuplicate(pkg, e) {
    e.stopPropagation();
    const duplicated = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      title: `${pkg.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSavePackage(duplicated);
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this package?")) {
      onDeletePackage(id);
    }
  }

  function openSchedulingModal(pkg, e) {
    e.stopPropagation();
    setSchedulingPkg(pkg);
    setSchedulePlatforms(pkg.platforms || []);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime("09:00");
  }

  function handleConfirmSchedule() {
    if (!scheduleDate || !scheduleTime) return alert("Select date and time.");
    if (schedulePlatforms.length === 0) return alert("Select at least one platform.");
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    onSchedulePost(schedulingPkg, scheduledDateTime, schedulePlatforms);
    setSchedulingPkg(null);
  }

  // ─── FOLDERS VIEW ──────────────────────────────────────────
  if (viewMode === "folders") {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Content Library</h1>
            <p style={styles.pageSubtitle}>Your brand folders with all generated content packages.</p>
          </div>
          <div style={styles.totalBadge} className="hand-drawn">
            <span style={{ fontSize: "18px" }}>📦</span>
            <span style={{ fontSize: "13px", fontWeight: "700" }}>{packages.length} packages</span>
          </div>
        </header>

        <div style={styles.folderGrid}>
          {projects.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: "48px" }}>📁</span>
              <h3 style={{ margin: 0, fontWeight: "700" }}>No brand folders yet</h3>
              <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
                Go to <strong>Studio</strong> to create content — a brand folder will be created automatically.
              </p>
              <button onClick={() => setView("create")} style={styles.ctaBtn} className="hand-drawn-btn">
                Go to Studio ✦
              </button>
            </div>
          ) : (
            projects.map(project => {
              const count = getPackageCount(project.id);
              const lastUpdate = getLastUpdated(project.id);
              return (
                <button
                  key={project.id}
                  onClick={() => openFolder(project.id)}
                  style={{ ...styles.folderCard, background: getCardBg(project.id) }}
                  className="hand-drawn-btn offset-border"
                >
                  <div style={styles.folderIconWrap}>📁</div>
                  <h3 style={styles.folderName}>{project.name}</h3>
                  {project.brandVoice && (
                    <span style={styles.folderVoiceTag}>{project.brandVoice}</span>
                  )}
                  <div style={styles.folderMeta}>
                    <span style={styles.folderCount}>
                      {count} {count === 1 ? "package" : "packages"}
                    </span>
                    {lastUpdate && <span style={styles.folderDate}>Updated {lastUpdate}</span>}
                  </div>
                </button>
              );
            })
          )}

          {/* All content folder */}
          {projects.length > 0 && (
            <button
              onClick={() => {
                setActiveFolderId("__all__");
                setViewMode("packages");
              }}
              style={{ ...styles.folderCard, borderStyle: "dashed", background: "#faf9f6" }}
              className="hand-drawn-btn"
            >
              <div style={styles.folderIconWrap}>🗂️</div>
              <h3 style={styles.folderName}>All Content</h3>
              <div style={styles.folderMeta}>
                <span style={styles.folderCount}>{packages.length} total</span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── PACKAGES VIEW (inside a folder) ──────────────────────
  const displayPackages = activeFolderId === "__all__"
    ? packages.filter(p => {
        if (!search) return true;
        return p.title?.toLowerCase().includes(search.toLowerCase()) ||
               p.sourceText?.toLowerCase().includes(search.toLowerCase());
      })
    : folderPackages;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={goBackToFolders} style={styles.backBtn} className="hand-drawn-btn">
            ← Folders
          </button>
          <div>
            <h1 style={styles.pageTitle}>
              {activeFolderId === "__all__" ? "All Content" : (activeFolder?.name || "Folder")}
            </h1>
            <p style={styles.pageSubtitle}>
              {displayPackages.length} {displayPackages.length === 1 ? "package" : "packages"}
            </p>
          </div>
        </div>
      </header>

      {/* Search bar */}
      <div style={styles.searchRow}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packages..."
          style={styles.searchBar}
          className="hand-drawn-input"
        />
      </div>

      {/* Package list */}
      {displayPackages.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: "36px" }}>📄</span>
          <p style={{ margin: 0, color: "#999" }}>
            {search ? "No packages match your search." : "No content packages in this folder yet."}
          </p>
          <button onClick={() => setView("create")} style={styles.ctaBtn} className="hand-drawn-btn">
            Create Content in Studio ✦
          </button>
        </div>
      ) : (
        <div style={styles.packageList}>
          {displayPackages.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkg(pkg)}
              style={styles.packageCard}
              className="hand-drawn offset-border"
            >
              <div style={styles.pkgHeader}>
                <div>
                  <h4 style={styles.pkgTitle}>{pkg.title || "Untitled Draft"}</h4>
                  <span style={styles.pkgBrand}>
                    {projects.find(p => p.id === pkg.projectId)?.name || "Unknown Brand"}
                  </span>
                </div>
                <span style={{ ...styles.statusBadge, ...getStatusStyle(pkg.status) }} className="hand-drawn">
                  {pkg.status}
                </span>
              </div>

              <p style={styles.pkgSnippet}>
                {pkg.sourceText?.substring(0, 140)}...
              </p>

              <div style={styles.pkgFooter}>
                <div style={styles.pkgPlatforms}>
                  {pkg.platforms?.map(p => {
                    const info = CHANNELS.find(([key]) => key === p);
                    return (
                      <span key={p} style={{ display: "inline-flex", alignItems: "center", marginRight: "6px" }}>
                        {info && Icons[p] ? Icons[p]({ size: 14, color: "var(--ink-black)" }) : "🔌"}
                      </span>
                    );
                  })}
                </div>
                <div style={styles.pkgActions}>
                  <button onClick={(e) => openSchedulingModal(pkg, e)} style={styles.actionBtn} className="hand-drawn-btn">📅 Schedule</button>
                  <button onClick={(e) => handleDuplicate(pkg, e)} style={styles.actionBtn} className="hand-drawn-btn">📋 Copy</button>
                  <button onClick={(e) => handleDelete(pkg.id, e)} style={styles.deleteBtn} className="hand-drawn-btn">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPkg && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPkg(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="hand-drawn">
            <button onClick={() => setSelectedPkg(null)} style={styles.closeModalBtn} className="hand-drawn-btn">✕ Close</button>
            <div style={{ marginTop: "16px" }}>
              <PlatformPreviews
                generationResult={selectedPkg}
                onSave={(editedPosts) => {
                  const updated = {
                    ...selectedPkg,
                    posts: editedPosts,
                    updatedAt: new Date().toISOString()
                  };
                  onSavePackage(updated);
                  setSelectedPkg(null);
                }}
                onCancel={() => setSelectedPkg(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {schedulingPkg && (
        <div style={styles.modalOverlay} onClick={() => setSchedulingPkg(null)}>
          <div style={styles.modalSmall} onClick={(e) => e.stopPropagation()} className="hand-drawn">
            <h3 style={styles.modalTitle}>📅 Schedule Content</h3>
            <p style={{ fontSize: "13px", color: "#999" }}>Set date/time for "{schedulingPkg.title}".</p>

            <div style={styles.formCol}>
              <label style={styles.label}>Date</label>
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Time</label>
              <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Platforms</label>
              <div style={styles.checkboxGroup}>
                {schedulingPkg.platforms?.map(p => {
                  const info = CHANNELS.find(([key]) => key === p);
                  return (
                    <label key={p} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={schedulePlatforms.includes(p)}
                        onChange={() => {
                          setSchedulePlatforms(prev =>
                            prev.includes(p) ? prev.filter(c => c !== p) : [...prev, p]
                          );
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      {info ? info[2] : "🔌"} {info ? info[1] : p}
                    </label>
                  );
                })}
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={handleConfirmSchedule} style={styles.confirmBtn} className="hand-drawn-btn">Confirm</button>
              <button onClick={() => setSchedulingPkg(null)} style={styles.cancelBtn} className="hand-drawn-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case "posted":
      return { background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderColor: "#10b981" };
    case "scheduled":
      return { background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", borderColor: "#6366f1" };
    case "ready":
      return { background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", borderColor: "#38bdf8" };
    case "failed":
      return { background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e", borderColor: "#f43f5e" };
    default:
      return { background: "rgba(148, 163, 184, 0.1)", color: "#94a3b8", borderColor: "#94a3b8" };
  }
}

// ─── STYLES ─────────────────────────────────────────────────
const styles = {
  container: {
    padding: "32px 40px",
    maxWidth: "960px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "var(--ink-black)",
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#999",
    margin: "4px 0 0 0"
  },
  totalBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    background: "var(--pastel-yellow)",
    border: "2px solid var(--ink-black)",
    borderRadius: "10px",
    boxShadow: "2px 2px 0px var(--ink-black)"
  },
  backBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    background: "#fff",
    border: "2px solid var(--ink-black)",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--ink-black)",
    boxShadow: "2px 2px 0px var(--ink-black)"
  },

  // Folder grid
  folderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px"
  },
  folderCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "28px 20px",
    border: "2.5px solid var(--ink-black)",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    textAlign: "center",
    boxShadow: "4px 4px 0px var(--ink-black)"
  },
  folderIconWrap: {
    fontSize: "36px",
    marginBottom: "4px"
  },
  folderName: {
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--ink-black)",
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif"
  },
  folderVoiceTag: {
    fontSize: "10px",
    fontWeight: "600",
    padding: "2px 10px",
    borderRadius: "20px",
    background: "rgba(0,0,0,0.06)",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  folderMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginTop: "4px"
  },
  folderCount: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--ink-black)"
  },
  folderDate: {
    fontSize: "10px",
    color: "#aaa"
  },

  // Search
  searchRow: {
    display: "flex",
    gap: "12px"
  },
  searchBar: {
    flexGrow: 1,
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    padding: "12px 18px",
    color: "var(--ink-black)",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit"
  },

  // Package list
  packageList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  packageCard: {
    background: "#fff",
    border: "2.5px solid var(--ink-black)",
    borderRadius: "14px",
    padding: "20px 24px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  pkgHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "10px"
  },
  pkgTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--ink-black)",
    margin: 0
  },
  pkgBrand: {
    fontSize: "11px",
    color: "#999",
    marginTop: "2px",
    display: "block"
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
    border: "1.5px solid"
  },
  pkgSnippet: {
    fontSize: "13px",
    color: "#888",
    lineHeight: "1.5",
    margin: "0 0 16px 0"
  },
  pkgFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid rgba(0,0,0,0.06)",
    paddingTop: "12px"
  },
  pkgPlatforms: {
    display: "flex"
  },
  pkgActions: {
    display: "flex",
    gap: "8px"
  },
  actionBtn: {
    background: "#faf9f6",
    border: "2px solid rgba(0,0,0,0.08)",
    color: "var(--ink-black)",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit"
  },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.06)",
    border: "2px solid rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit"
  },

  // Empty state
  emptyState: {
    background: "#fff",
    border: "2.5px dashed rgba(0,0,0,0.12)",
    borderRadius: "16px",
    padding: "80px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  ctaBtn: {
    padding: "12px 28px",
    borderRadius: "12px",
    background: "var(--ink-black)",
    color: "#fff",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "3px 3px 0px var(--pastel-green)",
    fontFamily: "'Space Grotesk', sans-serif",
    marginTop: "8px"
  },

  // Modals
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "40px 20px"
  },
  modalContent: {
    background: "#fff",
    border: "2.5px solid var(--ink-black)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "960px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
    position: "relative",
    boxShadow: "6px 6px 0px var(--ink-black)"
  },
  modalSmall: {
    background: "#fff",
    border: "2.5px solid var(--ink-black)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "6px 6px 0px var(--ink-black)"
  },
  closeModalBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#faf9f6",
    border: "2px solid var(--ink-black)",
    borderRadius: "8px",
    color: "var(--ink-black)",
    padding: "6px 14px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--ink-black)",
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif"
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    background: "#fff",
    border: "2px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "var(--ink-black)",
    outline: "none",
    fontSize: "13px",
    fontFamily: "inherit"
  },
  checkboxGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--ink-black)",
    cursor: "pointer"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    borderTop: "1.5px solid rgba(0,0,0,0.06)",
    paddingTop: "16px"
  },
  confirmBtn: {
    background: "var(--ink-black)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "2px 2px 0px var(--pastel-green)"
  },
  cancelBtn: {
    background: "#fff",
    border: "2px solid var(--ink-black)",
    color: "var(--ink-black)",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit"
  }
};
