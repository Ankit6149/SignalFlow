import React, { useState, useEffect } from "react";
import { CHANNELS } from "../lib/config";

const VOICE_OPTIONS = ["professional", "founder-style", "technical", "educational", "casual", "launch-style"];
const GOAL_OPTIONS = ["launch", "feature announcement", "educational", "behind the scenes", "demo", "update", "case study", "personal builder post"];

export default function ProjectManager({ projects, activeProjectId, onSave, onDelete, onSelectActive }) {
  const [selectedProj, setSelectedProj] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    const active = projects.find(p => p.id === activeProjectId) || projects[0];
    if (active && !selectedProj) {
      handleSelectProj(active);
    }
  }, [projects, activeProjectId]);

  function handleSelectProj(proj) {
    setSelectedProj(proj);
    setIsEditing(false);
    
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
  }

  function handleDelete(id) {
    if (confirm("Are you sure you want to delete this brand profile? This action is permanent.")) {
      onDelete(id);
      setSelectedProj(null);
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
        <button onClick={handleCreateNew} style={styles.primaryBtn}>
          + New Brand Profile
        </button>
      </header>

      <div style={styles.body}>
        {/* Left Column - List */}
        <div style={styles.leftCol}>
          <div style={styles.list}>
            {projects.map(proj => {
              const isActive = activeProjectId === proj.id;
              const isSelected = selectedProj?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProj(proj)}
                  style={{
                    ...styles.listItem,
                    ...(isSelected ? styles.listItemSelected : {})
                  }}
                >
                  <div style={styles.listInfo}>
                    <div style={styles.listNameRow}>
                      <span style={styles.listName}>{proj.name}</span>
                      {isActive && <span style={styles.activeBadge}>Active</span>}
                    </div>
                    <span style={styles.listDesc}>{proj.description?.substring(0, 75)}...</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Detail/Edit */}
        <div style={styles.rightCol}>
          {selectedProj ? (
            <div style={styles.card}>
              {!isEditing ? (
                /* VIEW MODE */
                <div>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardName}>{selectedProj.name}</h3>
                      {selectedProj.url && <a href={selectedProj.url} target="_blank" rel="noreferrer" style={styles.cardLink}>{selectedProj.url}</a>}
                    </div>
                    <div style={styles.btnGroup}>
                      {activeProjectId !== selectedProj.id && (
                        <button onClick={() => onSelectActive(selectedProj.id)} style={styles.activateBtn}>
                          Set Active
                        </button>
                      )}
                      <button onClick={() => setIsEditing(true)} style={styles.secondaryBtn}>Edit</button>
                      <button onClick={() => handleDelete(selectedProj.id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Description</span>
                      <p style={styles.detailVal}>{selectedProj.description || "None configured."}</p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Target Audience</span>
                      <p style={styles.detailVal}>{selectedProj.audience || "None configured."}</p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Brand Voice</span>
                      <p style={styles.detailVal}><span style={styles.tag}>{selectedProj.brandVoice}</span></p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Category</span>
                      <p style={styles.detailVal}>{selectedProj.category || "None configured."}</p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Primary Call to Action</span>
                      <p style={styles.detailVal}>{selectedProj.cta || "None configured."}</p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Target Platforms</span>
                      <div style={styles.tagGroup}>
                        {selectedProj.platforms?.map(p => {
                          const info = CHANNELS.find(([key]) => key === p);
                          return <span key={p} style={styles.tag}>{info ? info[1] : p}</span>;
                        })}
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Visual Design Heuristics</span>
                      <p style={styles.detailVal}>{selectedProj.visualStyle || "None configured."}</p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Default Hashtags</span>
                      <p style={styles.detailVal}>
                        {selectedProj.hashtags?.length > 0 ? selectedProj.hashtags.map(t => `#${t}`).join(" ") : "None."}
                      </p>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Content Marketing Goals</span>
                      <div style={styles.tagGroup}>
                        {selectedProj.goals?.map(g => <span key={g} style={styles.tagGoal}>{g}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSave} style={styles.form}>
                  <h3 style={styles.formTitle}>
                    {selectedProj.createdAt ? `Edit Brand: ${selectedProj.name}` : "Create Brand Profile"}
                  </h3>
                  
                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Brand/Project Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. Acme SaaS"
                        required
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
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Product Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. Developer Tools / Marketing"
                      />
                    </div>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Brand Voice Tone</label>
                      <select
                        value={brandVoice}
                        onChange={(e) => setBrandVoice(e.target.value)}
                        style={styles.input}
                      >
                        {VOICE_OPTIONS.map(v => (
                          <option key={v} value={v}>{v.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.formCol}>
                    <label style={styles.label}>Short Description (Elevator Pitch)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={styles.textarea}
                      placeholder="Describe the product value proposition, problem solved, and main benefits."
                      rows={3}
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Target Audience Persona</label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. indie developers, SaaS marketers"
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
                      />
                    </div>
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

                  <div style={styles.formRow}>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Visual Style Notes / Aesthetics</label>
                      <input
                        type="text"
                        value={visualStyle}
                        onChange={(e) => setVisualStyle(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. Neon grid borders, bold typography, rich gradients"
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
                      />
                    </div>
                  </div>

                  <div style={styles.formCol}>
                    <label style={styles.label}>Competitor / Reference URL Links (comma separated)</label>
                    <input
                      type="text"
                      value={references}
                      onChange={(e) => setReferences(e.target.value)}
                      style={styles.input}
                      placeholder="e.g. https://linear.app, https://stripe.com"
                    />
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" style={styles.primaryBtn}>Save Brand Profile</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={styles.noSelection}>
              <span style={{ fontSize: "36px" }}>👤</span>
              <p>Select a brand profile or click "+ New Brand Profile" to create one.</p>
            </div>
          )}
        </div>
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
  }
};
