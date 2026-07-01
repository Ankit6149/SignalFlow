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
  setView
}) {
  const getCardClass = (id) => {
    const cardStyles = ["hand-drawn", "hand-drawn-wavy", "hand-drawn-rough", "hand-drawn-skew"];
    const codeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cardStyles[codeSum % cardStyles.length];
  };

  const getCardBg = (id) => {
    const cardBgs = ["var(--pastel-green)", "var(--pastel-yellow)", "var(--pastel-blue)", "var(--pastel-lavender)", "var(--pastel-red)"];
    const codeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cardBgs[codeSum % cardBgs.length];
  };

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Modal/Detail states
  const [selectedPkg, setSelectedPkg] = useState(null);
  
  // Scheduling modal states
  const [schedulingPkg, setSchedulingPkg] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [schedulePlatforms, setSchedulePlatforms] = useState([]);

  // Filter packages list
  const filtered = packages.filter(pkg => {
    const matchesSearch = pkg.title?.toLowerCase().includes(search.toLowerCase()) || 
                          pkg.sourceText?.toLowerCase().includes(search.toLowerCase());
    const matchesProject = filterProject === "all" || pkg.projectId === filterProject;
    const matchesStatus = filterStatus === "all" || pkg.status === filterStatus;
    return matchesSearch && matchesProject && matchesStatus;
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
    
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime("09:00");
  }

  function handleConfirmSchedule() {
    if (!scheduleDate || !scheduleTime) return alert("Select date and time.");
    if (schedulePlatforms.length === 0) return alert("Select at least one platform.");

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    // Trigger scheduling on parent
    onSchedulePost(schedulingPkg, scheduledDateTime, schedulePlatforms);

    // Close modal
    setSchedulingPkg(null);
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Content Library</h2>
          <p style={styles.subtitle}>Explore, preview, schedule, or duplicate all generated AI social post drafts.</p>
        </div>
      </header>

      {/* Filter and Search controls */}
      <section style={styles.filterRow}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description content..."
          style={styles.searchBar}
          className="hand-drawn-input"
        />
        
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={styles.select}
          className="hand-drawn-input"
        >
          <option value="all">All Brand Profiles</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.select}
          className="hand-drawn-input"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
          <option value="posted">Posted</option>
          <option value="failed">Failed</option>
        </select>
      </section>

      {/* Main List */}
      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: "36px" }}>📚</span>
            <p>No content packages match your criteria.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                style={{ ...styles.card, background: "#ffffff" }}
                className={`${getCardClass(pkg.id)} offset-border`}
              >
                <div style={styles.cardMain}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h4 style={styles.cardTitle}>{pkg.title || "Untitled Draft"}</h4>
                      <span style={styles.cardProject}>
                        Brand: {projects.find(p => p.id === pkg.projectId)?.name || "Unknown"}
                      </span>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(pkg.status),
                      borderColor: "var(--ink-black)",
                      borderWidth: "1.5px"
                    }} className="hand-drawn">
                      {pkg.status}
                    </span>
                  </div>

                  <p style={styles.cardBodySnippet}>
                    {pkg.sourceText?.substring(0, 120)}...
                  </p>

                  <div style={styles.cardFooter}>
                    <div style={styles.channelRow}>
                      {pkg.platforms?.map(p => {
                        const info = CHANNELS.find(([key]) => key === p);
                        return (
                          <span key={p} style={{ marginRight: "6px", display: "inline-flex", alignItems: "center" }}>
                            {info && Icons[p] ? Icons[p]({ size: 14, color: "var(--ink-black)" }) : "🔌"}
                          </span>
                        );
                      })}
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={(e) => openSchedulingModal(pkg, e)} style={styles.actionBtn} className="hand-drawn-btn">Schedule</button>
                      <button onClick={(e) => handleDuplicate(pkg, e)} style={styles.actionBtn} className="hand-drawn-btn">Duplicate</button>
                      <button onClick={(e) => handleDelete(pkg.id, e)} style={styles.deleteBtn} className="hand-drawn-btn">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
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
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>📅 Schedule Content package</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>Set date/time to enqueue posts for "{schedulingPkg.title}".</p>

            <div style={styles.formCol}>
              <label style={styles.label}>Publish Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formCol}>
              <label style={styles.label}>Publish Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                style={styles.input}
              />
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
                        style={styles.checkbox}
                      />
                      {info ? info[2] : "🔌"} {info ? info[1] : p}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={handleConfirmSchedule} style={styles.confirmBtn}>Confirm Schedule</button>
              <button onClick={() => setSchedulingPkg(null)} style={styles.cancelBtn}>Cancel</button>
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
      return { background: "rgba(16, 185, 129, 0.15)", color: "#10b981" };
    case "scheduled":
      return { background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" };
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
  filterRow: {
    display: "flex",
    gap: "16px"
  },
  searchBar: {
    flexGrow: 1,
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#121612",
    outline: "none",
    fontSize: "14px"
  },
  select: {
    background: "#ffffff",
    color: "#121612",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    padding: "10px 16px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    cursor: "pointer"
  },
  grid: {
    flexGrow: 1
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)",
    transition: "all 0.2s ease"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "10px"
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#121612",
    margin: 0
  },
  cardProject: {
    fontSize: "11px",
    color: "#59635c",
    marginTop: "2px",
    display: "block"
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    textTransform: "uppercase"
  },
  cardBodySnippet: {
    fontSize: "13px",
    color: "#59635c",
    lineHeight: "1.4",
    margin: "0 0 16px 0"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "12px"
  },
  channelRow: {
    display: "flex"
  },
  cardActions: {
    display: "flex",
    gap: "10px"
  },
  actionBtn: {
    background: "rgba(18, 22, 18, 0.04)",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    color: "#121612",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  deleteBtn: {
    background: "rgba(244, 63, 94, 0.06)",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    color: "#e11d48",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  emptyState: {
    background: "#ffffff",
    border: "1px dashed rgba(18, 22, 18, 0.15)",
    borderRadius: "16px",
    padding: "80px 20px",
    textAlign: "center",
    color: "#59635c",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(18, 22, 18, 0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "40px 20px"
  },
  modalContent: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "960px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
    position: "relative",
    boxShadow: "0 24px 60px rgba(18, 22, 18, 0.1)"
  },
  modalContentSmall: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 24px 60px rgba(18, 22, 18, 0.1)"
  },
  closeModalBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(18, 22, 18, 0.05)",
    border: "none",
    borderRadius: "8px",
    color: "#121612",
    padding: "8px 16px",
    fontWeight: "700",
    cursor: "pointer"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#121612"
  },
  input: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#121612",
    outline: "none",
    fontSize: "14px"
  },
  checkboxGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#121612",
    cursor: "pointer"
  },
  checkbox: {
    cursor: "pointer"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "16px"
  },
  confirmBtn: {
    background: "#24715d",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(18, 22, 18, 0.15)",
    color: "#121612",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  }
};
