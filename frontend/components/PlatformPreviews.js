import React, { useState } from "react";
import { CHANNELS } from "../lib/config";

export default function PlatformPreviews({
  generationResult,
  onSave,
  onCancel,
  onPublishNow,
  onSchedulePost,
  onExport
}) {
  const { posts = {}, media = {}, json = {}, image_base64 = "" } = generationResult;
  
  // Set up initial editable draft states
  const [linkedinBody, setLinkedinBody] = useState(posts.linkedin || "");
  const [xPosts, setXPosts] = useState(
    Array.isArray(json.posts?.x?.posts) 
      ? json.posts.x.posts 
      : (posts.x ? posts.x.split("\n\n") : [""])
  );
  const [instagramCaption, setInstagramCaption] = useState(posts.instagram || "");
  const [redditBody, setRedditBody] = useState(posts.reddit || "");
  const [hnBody, setHnBody] = useState(posts.hn || "");
  const [blogBody, setBlogBody] = useState(posts.blog || "");
  const [newsletterBody, setNewsletterBody] = useState(posts.newsletter || "");
  
  // Script and Carousel outline edit states
  const [videoScript, setVideoScript] = useState(
    media.videoScript ? media.videoScript.join("\n") : ""
  );
  const [carouselPlan, setCarouselPlan] = useState(
    media.carouselPlan ? media.carouselPlan.join("\n") : ""
  );

  const [activeTab, setActiveTab] = useState("linkedin");

  // Local actions states
  const [copiedLabel, setCopiedLabel] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  function handleSaveDraft() {
    // Collect updated contents
    const updatedPosts = {
      linkedin: linkedinBody,
      x: xPosts.join("\n\n"),
      instagram: instagramCaption,
      reddit: redditBody,
      hn: hnBody,
      blog: blogBody,
      newsletter: newsletterBody
    };

    onSave(updatedPosts);
  }

  function handleXPostChange(idx, val) {
    const updated = [...xPosts];
    updated[idx] = val;
    setXPosts(updated);
  }

  function handleAddTweet() {
    setXPosts(prev => [...prev, ""]);
  }

  function handleRemoveTweet(idx) {
    if (xPosts.length <= 1) return;
    setXPosts(prev => prev.filter((_, i) => i !== idx));
  }

  function getActiveContentText() {
    switch (activeTab) {
      case "linkedin": return linkedinBody;
      case "x": return xPosts.join("\n\n");
      case "instagram": return instagramCaption;
      case "reddit": return redditBody;
      case "hn": return hnBody;
      case "blog": return blogBody;
      case "newsletter": return newsletterBody;
      case "video_script": return videoScript;
      case "carousel_plan": return carouselPlan;
      default: return "";
    }
  }

  function handleCopyContent() {
    const text = getActiveContentText();
    navigator.clipboard.writeText(text);
    setCopiedLabel("copy");
    setTimeout(() => setCopiedLabel(""), 1500);
  }

  function handlePublishContent() {
    if (onPublishNow) {
      onPublishNow(activeTab, getActiveContentText(), generationResult.title || "Content Package");
    } else {
      alert("Direct publishing is only available when previewing saved drafts or links connected.");
    }
  }

  function handleOpenSchedule() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime("09:00");
    setIsScheduling(true);
  }

  function handleConfirmSchedule() {
    if (!scheduleDate || !scheduleTime) return alert("Select date and time.");
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    if (onSchedulePost) {
      // Mock package structure
      const titleName = generationResult.title || "Content Package";
      const simulatedPkg = {
        id: `pkg-${Date.now()}`,
        title: titleName,
        posts: {
          [activeTab]: getActiveContentText()
        },
        platforms: [activeTab]
      };
      onSchedulePost(simulatedPkg, scheduledDateTime, [activeTab]);
    } else {
      alert("Scheduling is not available.");
    }
    setIsScheduling(false);
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h3 style={styles.title}>Package Review & Customization</h3>
          <p style={styles.subtitle}>Modify generated post draft structures before pushing to queues.</p>
        </div>
        <div style={styles.btnGroup}>
          {onExport && (
            <>
              <button onClick={() => onExport("/api/export/zip", "zip", generationResult)} style={styles.actionBtnSecondary}>
                📥 Download ZIP
              </button>
              <button onClick={() => onExport("/api/export/markdown", "md", generationResult)} style={styles.actionBtnSecondary}>
                📝 Download Markdown
              </button>
            </>
          )}
          <button onClick={handleSaveDraft} style={styles.primaryBtn}>Save Draft to Library</button>
          <button onClick={onCancel} style={styles.cancelBtn}>Back</button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Left Side: Tabs */}
        <div style={styles.tabCol}>
          {CHANNELS.map(([key, label, emoji, color]) => {
            const hasContent = posts[key] || (key === "release_notes" && posts.release_notes);
            if (!hasContent) return null;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  ...styles.tabBtn,
                  ...(isActive ? styles.tabBtnActive : {}),
                  borderLeft: isActive ? `4px solid ${color}` : "4px solid transparent"
                }}
              >
                <span>{emoji}</span>
                <span style={styles.tabLabel}>{label}</span>
              </button>
            );
          })}
          
          <div style={styles.divider}>Media Plans</div>
          
          {media.videoScript && (
            <button
              onClick={() => setActiveTab("video_script")}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "video_script" ? styles.tabBtnActive : {})
              }}
            >
              <span>🎥</span>
              <span style={styles.tabLabel}>Shorts / TikTok Script</span>
            </button>
          )}

          {media.carouselPlan && (
            <button
              onClick={() => setActiveTab("carousel_plan")}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "carousel_plan" ? styles.tabBtnActive : {})
              }}
            >
              <span>📊</span>
              <span style={styles.tabLabel}>Carousel Plan</span>
            </button>
          )}
        </div>

        {/* Right Side: Mock Preview Card & Editor */}
        <div style={styles.previewCol}>
          <div style={styles.previewWrapper}>
            {/* LINKEDIN PREVIEW */}
            {activeTab === "linkedin" && (
              <div style={styles.linkedinCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.linkedinAvatar}>SF</div>
                  <div>
                    <div style={styles.linkedinName}>SignalFlow Member</div>
                    <div style={styles.linkedinSubtitle}>Product Marketer • Just now</div>
                  </div>
                </div>
                
                <textarea
                  value={linkedinBody}
                  onChange={(e) => setLinkedinBody(e.target.value)}
                  style={styles.cardTextarea}
                  rows={10}
                />

                {image_base64 && (
                  <div style={styles.imagePreviewContainer}>
                    <img
                      src={`data:image/svg+xml;base64,${image_base64}`}
                      alt="Generated Post Card"
                      style={styles.previewImage}
                    />
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>🔁 Repost</span>
                  <span>✉️ Send</span>
                </div>
              </div>
            )}

            {/* X/TWITTER PREVIEW */}
            {activeTab === "x" && (
              <div style={styles.xCardList}>
                {xPosts.map((tweet, i) => (
                  <div key={i} style={styles.xCard}>
                    <div style={styles.cardHeader}>
                      <div style={styles.xAvatar}>SF</div>
                      <div style={styles.xHeaderDetails}>
                        <div style={styles.xNameRow}>
                          <span style={styles.xName}>SignalBuilder</span>
                          <span style={styles.xHandle}>@signalflow • {i + 1}/{xPosts.length}</span>
                        </div>
                        
                        <textarea
                          value={tweet}
                          onChange={(e) => handleXPostChange(i, e.target.value)}
                          style={styles.cardTextarea}
                          rows={4}
                          maxLength={280}
                        />

                        <div style={styles.charCounter}>
                          {tweet.length} / 280 chars
                        </div>
                      </div>
                      
                      {xPosts.length > 1 && (
                        <button onClick={() => handleRemoveTweet(i)} style={styles.removeTweetBtn}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button onClick={handleAddTweet} style={styles.addTweetBtn}>
                  + Add Post to Thread
                </button>
              </div>
            )}

            {/* INSTAGRAM PREVIEW */}
            {activeTab === "instagram" && (
              <div style={styles.instaCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.instaAvatar}>SF</div>
                  <span style={styles.instaName}>signalflow_studio</span>
                </div>

                {image_base64 ? (
                  <div style={styles.instaImageContainer}>
                    <img
                      src={`data:image/svg+xml;base64,${image_base64}`}
                      alt="Instagram Post"
                      style={styles.previewImage}
                    />
                  </div>
                ) : (
                  <div style={styles.instaMockImage}>
                    <span>📷 Ingested Media Showcase</span>
                  </div>
                )}

                <div style={styles.instaActions}>
                  <span>❤️</span> <span>💬</span> <span>✈️</span>
                </div>

                <div style={styles.instaCaptionContainer}>
                  <strong style={{ marginRight: "6px" }}>signalflow_studio</strong>
                  <textarea
                    value={instagramCaption}
                    onChange={(e) => setInstagramCaption(e.target.value)}
                    style={styles.cardTextarea}
                    rows={6}
                  />
                </div>
              </div>
            )}

            {/* REDDIT PREVIEW */}
            {activeTab === "reddit" && (
              <div style={styles.redditCard}>
                <div style={styles.redditHeader}>
                  <span style={styles.redditSubreddit}>r/sideproject</span>
                  <span style={styles.redditMeta}>• Posted by u/signalbuilder</span>
                </div>
                <h4 style={styles.redditTitle}>{json.posts?.reddit?.title || "Product Showcase"}</h4>
                <textarea
                  value={redditBody}
                  onChange={(e) => setRedditBody(e.target.value)}
                  style={styles.cardTextarea}
                  rows={12}
                />
              </div>
            )}

            {/* HACKER NEWS PREVIEW */}
            {activeTab === "hn" && (
              <div style={styles.hnCard}>
                <div style={styles.hnTitleRow}>
                  <span style={styles.hnRank}>1.</span>
                  <span style={styles.hnTriangle}>▲</span>
                  <strong style={{ color: "#000" }}>
                    Show HN: {json.posts?.hackernews?.title || "My product launch"}
                  </strong>
                  <span style={styles.hnMeta}> (github.com/signalflow)</span>
                </div>
                <div style={styles.hnBodyBox}>
                  <textarea
                    value={hnBody}
                    onChange={(e) => setHnBody(e.target.value)}
                    style={{ ...styles.cardTextarea, color: "#000", background: "#f6f6ef" }}
                    rows={12}
                  />
                </div>
              </div>
            )}

            {/* BLOG PREVIEW */}
            {activeTab === "blog" && (
              <div style={styles.documentCard}>
                <h4 style={styles.docTitle}>{json.posts?.blog?.title || "Blog Post"}</h4>
                <textarea
                  value={blogBody}
                  onChange={(e) => setBlogBody(e.target.value)}
                  style={styles.cardTextarea}
                  rows={15}
                />
              </div>
            )}

            {/* NEWSLETTER PREVIEW */}
            {activeTab === "newsletter" && (
              <div style={styles.documentCard}>
                <div style={styles.newsletterHeader}>
                  <div><strong>Subject:</strong> {json.posts?.newsletter?.subject}</div>
                  <div><strong>Preview:</strong> {json.posts?.newsletter?.preview}</div>
                </div>
                <textarea
                  value={newsletterBody}
                  onChange={(e) => setNewsletterBody(e.target.value)}
                  style={styles.cardTextarea}
                  rows={15}
                />
              </div>
            )}

            {/* SHORTS / TIKTOK SCRIPT */}
            {activeTab === "video_script" && (
              <div style={styles.documentCard}>
                <h4 style={styles.docTitle}>🎥 Vertical Video Script Draft</h4>
                <textarea
                  value={videoScript}
                  onChange={(e) => setVideoScript(e.target.value)}
                  style={styles.cardTextarea}
                  rows={15}
                />
              </div>
            )}

            {/* CAROUSEL PLAN */}
            {activeTab === "carousel_plan" && (
              <div style={styles.documentCard}>
                <h4 style={styles.docTitle}>📊 Carousel Slides Layout</h4>
                <textarea
                  value={carouselPlan}
                  onChange={(e) => setCarouselPlan(e.target.value)}
                  style={styles.cardTextarea}
                  rows={15}
                />
              </div>
            )}
          </div>

          {/* Action Bar */}
          {["linkedin", "x", "instagram", "reddit", "hn", "blog", "newsletter"].includes(activeTab) && (
            <div style={styles.actionBar}>
              <button onClick={handleCopyContent} style={styles.actionBtnSecondary}>
                {copiedLabel === "copy" ? "✓ Copied!" : "📋 Copy Content"}
              </button>
              <button onClick={handlePublishContent} style={styles.actionBtnPrimary}>
                🚀 Post Now
              </button>
              <button onClick={handleOpenSchedule} style={styles.actionBtnSecondary}>
                📅 Schedule Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduling && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <h3 style={styles.modalTitle}>📅 Schedule Platform Post</h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              Choose publication date/time for {activeTab.toUpperCase()}.
            </p>

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

            <div style={styles.modalActions}>
              <button onClick={handleConfirmSchedule} style={styles.confirmBtn}>Confirm</button>
              <button onClick={() => setIsScheduling(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(18, 22, 18, 0.08)",
    paddingBottom: "16px"
  },
  title: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  subtitle: {
    fontSize: "13px",
    color: "#59635c",
    margin: "4px 0 0 0"
  },
  btnGroup: {
    display: "flex",
    gap: "10px"
  },
  primaryBtn: {
    background: "#24715d",
    color: "#ffffff",
    border: "none",
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
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "24px",
    alignItems: "start"
  },
  tabCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    background: "rgba(18, 22, 18, 0.04)",
    border: "none",
    borderRadius: "8px",
    color: "#59635c",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "13px",
    transition: "all 0.2s ease"
  },
  tabBtnActive: {
    background: "rgba(36, 113, 93, 0.1)",
    fontWeight: "700",
    color: "#24715d"
  },
  tabLabel: {
    flexGrow: 1
  },
  divider: {
    fontSize: "10px",
    color: "#59635c",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "16px 0 6px 6px"
  },
  previewCol: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  previewWrapper: {
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto"
  },
  cardTextarea: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    borderRadius: "8px",
    padding: "12px",
    color: "#121612",
    fontSize: "14px",
    lineHeight: "1.5",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit"
  },
  linkedinCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "#333"
  },
  linkedinAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#555"
  },
  linkedinName: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#191919"
  },
  linkedinSubtitle: {
    fontSize: "12px",
    color: "#666"
  },
  imagePreviewContainer: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e0e0e0"
  },
  previewImage: {
    width: "100%",
    display: "block"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    paddingTop: "12px",
    color: "#666",
    fontSize: "13px",
    fontWeight: "600"
  },
  xCardList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  xCard: {
    background: "#000000",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid #333",
    color: "#fff"
  },
  xAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#ccc"
  },
  xHeaderDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flexGrow: 1
  },
  xNameRow: {
    display: "flex",
    gap: "6px",
    alignItems: "center"
  },
  xName: {
    fontWeight: "700",
    fontSize: "14px"
  },
  xHandle: {
    fontSize: "12px",
    color: "#71767b"
  },
  removeTweetBtn: {
    background: "transparent",
    border: "none",
    color: "#f43f5e",
    fontWeight: "700",
    cursor: "pointer",
    padding: "0 4px"
  },
  charCounter: {
    fontSize: "11px",
    color: "#71767b",
    alignSelf: "flex-end"
  },
  addTweetBtn: {
    alignSelf: "flex-start",
    background: "rgba(36, 113, 93, 0.1)",
    border: "1px solid rgba(36, 113, 93, 0.2)",
    color: "#24715d",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  instaCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px 0",
    border: "1px solid #dbdbdb",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "#000"
  },
  instaAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#dbdbdb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "#555"
  },
  instaName: {
    fontWeight: "600",
    fontSize: "14px"
  },
  instaImageContainer: {
    borderTop: "1px solid #efefef",
    borderBottom: "1px solid #efefef"
  },
  instaMockImage: {
    width: "100%",
    aspectRatio: "1/1",
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8e8e8e",
    fontSize: "14px",
    fontWeight: "600"
  },
  instaActions: {
    display: "flex",
    gap: "16px",
    padding: "0 16px",
    fontSize: "18px"
  },
  instaCaptionContainer: {
    padding: "0 16px"
  },
  redditCard: {
    background: "#1a1a1b",
    border: "1px solid #343536",
    borderRadius: "8px",
    padding: "20px",
    color: "#d7dadc"
  },
  redditHeader: {
    display: "flex",
    gap: "8px",
    fontSize: "12px",
    color: "#818384",
    marginBottom: "8px"
  },
  redditSubreddit: {
    fontWeight: "700",
    color: "#d7dadc"
  },
  redditMeta: {
    color: "#818384"
  },
  redditTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#d7dadc"
  },
  hnCard: {
    background: "#f6f6ef",
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #d3d3d3",
    color: "#828282",
    fontFamily: "Verdana, Geneva, sans-serif"
  },
  hnTitleRow: {
    fontSize: "13px",
    marginBottom: "12px"
  },
  hnRank: {
    marginRight: "4px"
  },
  hnTriangle: {
    fontSize: "9px",
    marginRight: "4px"
  },
  hnMeta: {
    fontSize: "10px"
  },
  hnBodyBox: {
    background: "#f6f6ef",
    padding: "8px"
  },
  documentCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid rgba(18, 22, 18, 0.08)"
  },
  docTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#121612",
    margin: "0 0 16px 0"
  },
  newsletterHeader: {
    background: "rgba(18, 22, 18, 0.02)",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(18, 22, 18, 0.05)",
    fontSize: "13px",
    color: "#121612",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px"
  },
  actionBar: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "24px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "20px"
  },
  actionBtnPrimary: {
    background: "#ec6f4f",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  actionBtnSecondary: {
    background: "rgba(18, 22, 18, 0.04)",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    color: "#121612",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
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
    padding: "20px"
  },
  modalContentSmall: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.1)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 24px 60px rgba(18, 22, 18, 0.1)"
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

