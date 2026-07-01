import React, { useState, useEffect } from "react";
import { CHANNELS } from "../lib/config";
import { Icons } from "./Icons";

const VOICE_OPTIONS = ["professional", "founder-style", "technical", "educational", "casual", "launch-style"];
const GOAL_OPTIONS = ["launch", "feature announcement", "educational", "behind the scenes", "demo", "update", "case study", "personal builder post"];

export default function ProjectManager({ projects, activeProjectId, onSave, onDelete, onSelectActive }) {
  const [selectedProj, setSelectedProj] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [brandVoice, setBrandVoice] = useState("founder-style");
  const [category, setCategory] = useState("");
  const [cta, setCta] = useState("");
  const [platforms, setPlatforms] = useState(["linkedin", "x"]);
  const [visualStyle, setVisualStyle] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [references, setReferences] = useState("");
  const [goals, setGoals] = useState(["launch"]);

  const getBorderClass = (id) => {
    const borders = ["hand-drawn", "hand-drawn-wavy", "hand-drawn-rough", "hand-drawn-skew"];
    const codeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return borders[codeSum % borders.length];
  };

  const getPastelBg = (id) => {
    const colors = ["var(--pastel-green)", "var(--pastel-yellow)", "var(--pastel-blue)", "var(--pastel-lavender)", "var(--pastel-red)"];
    const codeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[codeSum % colors.length];
  };

  useEffect(() => {
    const active = projects.find(p => p.id === activeProjectId) || projects[0];
    if (active && !selectedProj) {
      setSelectedProj(active);
      setName(active.name || "");
      setUrl(active.url || "");
      setDescription(active.description || "");
      setAudience(active.audience || "");
      setBrandVoice(active.brandVoice || "founder-style");
      setCategory(active.category || "");
      setCta(active.cta || "");
      setPlatforms(active.platforms || []);
      setVisualStyle(active.visualStyle || "");
      setHashtags(active.hashtags ? (Array.isArray(active.hashtags) ? active.hashtags.join(", ") : active.hashtags) : "");
      setReferences(active.references ? (Array.isArray(active.references) ? active.references.join(", ") : active.references) : "");
      setGoals(active.goals || []);
    }
  }, [projects, activeProjectId]);

  function handleSelectProj(proj) {
    setSelectedProj(proj);
    setIsEditing(false);
    setIsDrawerOpen(true);
    
    // Fill form states
    setName(proj.name || "");
    setUrl(proj.url || "");
    setDescription(proj.description || "");
    setAudience(proj.audience || "");
    setBrandVoice(proj.brandVoice || "founder-style");
    setCategory(proj.category || "");
    setCta(proj.cta || "");
    setPlatforms(proj.platforms || []);
    setVisualStyle(proj.visualStyle || "");
    setHashtags(proj.hashtags ? (Array.isArray(proj.hashtags) ? proj.hashtags.join(", ") : proj.hashtags) : "");
    setReferences(proj.references ? (Array.isArray(proj.references) ? proj.references.join(", ") : proj.references) : "");
    setGoals(proj.goals || []);
  }

  function handleCreateNew() {
    setSelectedProj({ id: `proj-${Date.now()}` });
    setIsEditing(true);
    setIsDrawerOpen(true);

    setName("");
    setUrl("");
    setDescription("");
    setAudience("");
    setBrandVoice("founder-style");
    setCategory("");
    setCta("");
    setPlatforms(["linkedin", "x"]);
    setVisualStyle("");
    setHashtags("");
    setReferences("");
    setGoals(["launch"]);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Project Name is required.");

    const formattedHashtags = hashtags.split(",").map(t => t.trim().replace(/^#/, "")).filter(Boolean);
    const formattedRefs = references.split(",").map(r => r.trim()).filter(Boolean);

    const saved = {
      id: selectedProj.id,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      audience: audience.trim(),
      brandVoice,
      category: category.trim(),
      cta: cta.trim(),
      platforms,
      visualStyle: visualStyle.trim(),
      hashtags: formattedHashtags,
      references: formattedRefs,
      goals,
      createdAt: selectedProj.createdAt || new Date().toISOString()
    };

    onSave(saved);
    setSelectedProj(saved);
    setIsEditing(false);
    setIsDrawerOpen(false);
  }

  function handleDelete(id) {
    if (confirm("Are you sure you want to delete this brand profile? This action is permanent.")) {
      onDelete(id);
      setSelectedProj(null);
      setIsDrawerOpen(false);
    }
  }

  function handleTogglePlatform(plat) {
    setPlatforms(prev => 
      prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]
    );
  }

  function handleToggleGoal(goal) {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Brand Profiles & Projects</h2>
          <p style={styles.subtitle}>Setup guidelines, audience personas, and voices for automatic package alignment.</p>
        </div>
        <button onClick={handleCreateNew} style={styles.primaryBtn} className="hand-drawn-btn-wavy">
          + New Brand Profile
        </button>
      </header>

      {/* Grid gallery of profiles */}
      <div style={styles.galleryGrid}>
        {projects.map(proj => {
          const isActive = activeProjectId === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => handleSelectProj(proj)}
              style={{
                ...styles.profileCard,
                background: getPastelBg(proj.id)
              }}
              className={`${getBorderClass(proj.id)} offset-border`}
            >
              <div style={styles.cardInfo}>
                <div style={styles.cardNameRow}>
                  <h4 style={styles.cardNameText}>{proj.name}</h4>
                  {isActive && (
                    <span style={styles.activeBadge} className="hand-drawn">
                      Active
                    </span>
                  )}
                </div>
                
                <p style={styles.cardDescSnippet}>
                  {proj.description?.substring(0, 85) || "No description brief configured yet."}
                  {proj.description?.length > 85 ? "..." : ""}
                </p>

                <div style={styles.cardMetaPills}>
                  <span style={styles.metaLabelStamp}>{proj.brandVoice || "casual"}</span>
                  <span style={styles.metaLabelStamp}>{proj.category || "General"}</span>
                </div>

                <div style={styles.cardFooterPlatforms}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {proj.platforms?.map(plat => {
                      const info = CHANNELS.find(([key]) => key === plat);
                      return (
                        <span key={plat} title={plat} style={{ display: "inline-flex", alignItems: "center" }}>
                          {info && Icons[plat] ? Icons[plat]({ size: 13, color: "var(--ink-black)" }) : "🔌"}
                        </span>
                      );
                    })}
                  </div>
                  <span style={styles.configureLink} className="handwritten">Configure ➜</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* "+ New Brand Profile" card */}
        <div
          onClick={handleCreateNew}
          style={{
            ...styles.profileCard,
            background: "transparent",
            border: "2px dashed var(--ink-black)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "10px",
            minHeight: "180px",
            borderRadius: "15px"
          }}
          className="hand-drawn-wavy"
        >
          <span style={{ fontSize: "36px" }}>➕</span>
          <span style={{ fontWeight: "800", fontSize: "14px" }} className="handwritten">Add Brand Profile</span>
        </div>
      </div>

      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
      )}

      {/* Slide Drawer Content container */}
      <div className={`slide-drawer ${isDrawerOpen ? "open" : ""} hand-drawn`}>
        {selectedProj && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "2px solid var(--ink-black)", paddingBottom: "16px" }}>
              <h3 className="handwritten" style={{ margin: 0, fontSize: "20px" }}>
                {isEditing ? "✎ Edit Guidelines" : "✦ Brand Details"}
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "800",
                  cursor: "pointer",
                  color: "var(--ink-black)"
                }}
              >
                ✕
              </button>
            </div>

            {!isEditing ? (
              /* VIEW MODE */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "800" }}>{selectedProj.name}</h2>
                  {selectedProj.url && (
                    <a href={selectedProj.url} target="_blank" rel="noreferrer" style={styles.cardLink}>
                      {selectedProj.url}
                    </a>
                  )}
                </div>

                <div style={styles.drawerActionsBar}>
                  {activeProjectId !== selectedProj.id && (
                    <button onClick={() => { onSelectActive(selectedProj.id); setIsDrawerOpen(false); }} className="hand-drawn-btn">
                      Set Active ✦
                    </button>
                  )}
                  <button onClick={() => setIsEditing(true)} className="hand-drawn-btn">
                    Edit Guidelines
                  </button>
                  <button onClick={() => handleDelete(selectedProj.id)} className="hand-drawn-btn" style={{ background: "var(--pastel-red)" }}>
                    Delete ✕
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Elevator pitch / Description</span>
                    <p style={styles.drawerMetaVal}>{selectedProj.description || "None configured."}</p>
                  </div>
                  
                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Target Audience</span>
                    <p style={styles.drawerMetaVal}>{selectedProj.audience || "None configured."}</p>
                  </div>

                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Brand Voice & Category</span>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <span style={styles.tag} className="hand-drawn">{selectedProj.brandVoice}</span>
                      <span style={styles.tag} className="hand-drawn">{selectedProj.category || "General"}</span>
                    </div>
                  </div>

                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Primary Call to Action (CTA)</span>
                    <p style={styles.drawerMetaVal}>{selectedProj.cta || "None configured."}</p>
                  </div>

                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Default Hashtags</span>
                    <p style={styles.drawerMetaVal}>
                      {selectedProj.hashtags?.length > 0 ? selectedProj.hashtags.map(t => `#${t}`).join(" ") : "None."}
                    </p>
                  </div>

                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Visual Heuristics</span>
                    <p style={styles.drawerMetaVal}>{selectedProj.visualStyle || "None configured."}</p>
                  </div>
                  
                  <div style={styles.drawerMetaGroup}>
                    <span style={styles.detailLabel}>Social Media Targets</span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {selectedProj.platforms?.map(plat => {
                        const info = CHANNELS.find(([key]) => key === plat);
                        return (
                          <span key={plat} style={styles.tag} className="hand-drawn">
                            {info ? info[1] : plat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSave} style={styles.form}>
                <div style={styles.formCol}>
                  <label style={styles.label}>Brand/Project Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Acme SaaS"
                    required
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Website / Product URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={styles.input}
                    placeholder="https://acme.io"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Product Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Developer Tools / Marketing"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Brand Voice Tone</label>
                  <select
                    value={brandVoice}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    style={styles.input}
                    className="hand-drawn-input"
                  >
                    {VOICE_OPTIONS.map(v => (
                      <option key={v} value={v}>{v.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Short Description (Elevator Pitch)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={styles.textarea}
                    placeholder="Describe the product value proposition, problem solved, and main benefits."
                    rows={3}
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Target Audience Persona</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. indie developers, SaaS marketers"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Primary Call to Action (CTA)</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Sign up free at acme.io/register"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Target Social Platforms</label>
                  <div style={styles.checkboxGroup}>
                    {CHANNELS.map(([key, label, emoji]) => (
                      <label key={key} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={platforms.includes(key)}
                          onChange={() => handleTogglePlatform(key)}
                          style={styles.checkbox}
                        />
                        {emoji} {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Brand Marketing Goals</label>
                  <div style={styles.checkboxGroup}>
                    {GOAL_OPTIONS.map(goal => (
                      <label key={goal} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={goals.includes(goal)}
                          onChange={() => handleToggleGoal(goal)}
                          style={styles.checkbox}
                        />
                        {goal.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Visual Style Notes / Aesthetics</label>
                  <input
                    type="text"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Neon grid borders, bold typography, rich gradients"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Default Hashtags (comma separated)</label>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. indiehackers, startup, ai"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Competitor / Reference URL Links</label>
                  <input
                    type="text"
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. https://linear.app, https://stripe.com"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.primaryBtn} className="hand-drawn-btn">Save Guidelines</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn} className="hand-drawn-btn">Cancel</button>
                  </div>
                </form>
            )
          }
        </div>
      )}
    </div>
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
  secondaryBtn: {
    background: "rgba(18, 22, 18, 0.04)",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    color: "#121612",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  activateBtn: {
    background: "rgba(36, 113, 93, 0.1)",
    border: "1px solid rgba(36, 113, 93, 0.2)",
    color: "#24715d",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  deleteBtn: {
    background: "rgba(244, 63, 94, 0.06)",
    border: "1px solid rgba(244, 63, 94, 0.15)",
    color: "#e11d48",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(18, 22, 18, 0.15)",
    color: "#121612",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  body: {
    display: "grid",
    gridTemplateColumns: "1fr 2.2fr",
    gap: "24px",
    alignItems: "start",
    flexGrow: 1
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  listItem: {
    padding: "16px",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  listItemSelected: {
    borderColor: "#24715d",
    background: "rgba(36, 113, 93, 0.06)"
  },
  listInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  listNameRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  listName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612"
  },
  activeBadge: {
    background: "rgba(36, 113, 93, 0.1)",
    color: "#24715d",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase"
  },
  listDesc: {
    fontSize: "12px",
    color: "#59635c",
    lineHeight: "1.4"
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    borderBottom: "1px solid rgba(18, 22, 18, 0.08)",
    paddingBottom: "20px"
  },
  cardName: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  cardLink: {
    fontSize: "13px",
    color: "#ec6f4f",
    marginTop: "4px",
    display: "inline-block"
  },
  btnGroup: {
    display: "flex",
    gap: "10px"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px"
  },
  detailItem: {
    gridColumn: "span 2",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  detailLabel: {
    fontSize: "11px",
    color: "#59635c",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  detailVal: {
    fontSize: "14px",
    color: "#121612",
    lineHeight: "1.5",
    margin: 0
  },
  tagGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px"
  },
  tag: {
    background: "rgba(36, 113, 93, 0.1)",
    color: "#24715d",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "6px"
  },
  tagGoal: {
    background: "rgba(236, 111, 79, 0.1)",
    color: "#ec6f4f",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "6px"
  },
  noSelection: {
    background: "#ffffff",
    border: "1px dashed rgba(18, 22, 18, 0.15)",
    borderRadius: "16px",
    padding: "60px 20px",
    textAlign: "center",
    color: "#59635c",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: "0 0 8px 0"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%"
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
  textarea: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#121612",
    outline: "none",
    fontSize: "14px",
    resize: "vertical"
  },
  checkboxGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "10px",
    background: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid rgba(18, 22, 18, 0.12)"
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
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "20px"
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "28px",
    padding: "12px 0 32px 0",
    alignItems: "start"
  },
  profileCard: {
    border: "2px solid var(--ink-black)",
    borderRadius: "15px",
    padding: "24px 20px",
    position: "relative",
    transition: "all 0.2s ease-in-out",
    boxShadow: "3px 4px 0px var(--ink-black)",
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
    justifyContent: "space-between"
  },
  cardNameRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardNameText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--ink-black)",
    margin: 0,
    fontFamily: "'Space Grotesk', sans-serif"
  },
  cardDescSnippet: {
    fontSize: "13px",
    color: "#59635c",
    lineHeight: "1.45",
    margin: 0
  },
  cardMetaPills: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "4px"
  },
  metaLabelStamp: {
    fontSize: "10px",
    background: "#fff",
    border: "1.5px solid var(--ink-black)",
    color: "var(--ink-black)",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  cardFooterPlatforms: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1.5px solid var(--ink-black)",
    paddingTop: "12px",
    marginTop: "8px"
  },
  configureLink: {
    fontSize: "12px",
    fontWeight: "800",
    color: "var(--ink-black)"
  },
  drawerActionsBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    borderBottom: "1.5px solid var(--ink-black)",
    paddingBottom: "18px",
    marginBottom: "10px"
  },
  drawerMetaGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  drawerMetaVal: {
    fontSize: "13.5px",
    color: "var(--ink-black)",
    lineHeight: "1.5",
    margin: 0,
    background: "#fff",
    padding: "10px 14px",
    border: "1.5px solid var(--ink-black)",
    borderRadius: "8px"
  }
};
