import React, { useState, useEffect, useRef } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { CHANNELS, OUTPUT_TYPES, MODEL_ROUTES_META } from "../lib/config";
import PlatformPreviews from "./PlatformPreviews";
import { Icons } from "./Icons";

const TONE_OPTIONS = ["professional", "founder-style", "technical", "educational", "casual", "launch-style"];
const OUTPUT_PRESET_OPTIONS = [
  { id: "short", label: "Short Post" },
  { id: "long", label: "Long Post" },
  { id: "thread", label: "X Thread" },
  { id: "carousel", label: "Carousel Plan" },
  { id: "video", label: "Video Script" },
  { id: "launch", label: "Launch Package" },
  { id: "full", label: "Full Package" }
];

export default function ContentPackageCreationFlow({
  activeProject,
  aiSettings,
  onSavePackage,
  setView,
  initialSource = "manual",
  onPublishNow,
  onSchedulePost,
  onExport
}) {
  const [sourceType, setSourceType] = useState(initialSource === "manual" ? null : initialSource); // null, "record", "screenshot", "url", "notes", "repo"
  
  // Form values
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState(""); // What did you build
  const [audienceUnderstand, setAudienceUnderstand] = useState("");
  const [mainValue, setMainValue] = useState("");
  const [tone, setTone] = useState("founder-style");
  const [selectedChannels, setSelectedChannels] = useState(["linkedin", "x", "instagram", "newsletter"]);
  const [selectedOutputs, setSelectedOutputs] = useState(["caption", "text", "image", "video", "carousel", "doc"]);
  const [appUrl, setAppUrl] = useState("");
  const [pastedText, setPastedText] = useState(""); // For changelog/notes code
  const [currentStep, setCurrentStep] = useState(1); // 1: Context brief, 2: Target tuning & output generation
  const [showAdvancedTuning, setShowAdvancedTuning] = useState(false);

  // Scraping URL
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");

  // Media references
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [recordingNotes, setRecordingNotes] = useState("");
  const [showRecordingNotesForm, setShowRecordingNotesForm] = useState(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generationResult, setGenerationResult] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Ingesting release assets...");

  useEffect(() => {
    if (!isGenerating) return;
    const statuses = [
      "Scanning input material details...",
      "Analyzing core value hooks...",
      "Drafting LinkedIn post outlines...",
      "Writing native X/Twitter developer thread...",
      "Formatting release notes & documentation summaries...",
      "Polishing tone presets and audience alignments...",
      "Assembling final creative package..."
    ];
    let index = 0;
    setLoadingStatus(statuses[0]);
    const interval = setInterval(() => {
      index = (index + 1) % statuses.length;
      setLoadingStatus(statuses[index]);
    }, 1600);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Screen recorder setup
  const videoPreviewRef = useRef(null);
  const {
    captureStatus,
    setCaptureStatus,
    micEnabled,
    setMicEnabled,
    error: recorderError,
    startRecording,
    stopRecording,
    captureFrame
  } = useRecorder({
    onRecordingFinished: (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const newFile = {
        id: `record-${Date.now()}`,
        name: filename,
        size: blob.size,
        type: blob.type,
        category: "screen recording",
        url: url,
        blob: blob
      };
      setUploadedFiles(prev => [newFile, ...prev]);
      setShowRecordingNotesForm(true);
    },
    onScreenshotCaptured: (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const newFile = {
        id: `screenshot-${Date.now()}`,
        name: filename,
        size: blob.size,
        type: blob.type,
        category: "screenshot",
        url: url,
        blob: blob
      };
      setUploadedFiles(prev => [newFile, ...prev]);
    }
  });

  useEffect(() => {
    if (activeProject) {
      setTitle(`Launch kit for ${activeProject.name}`);
      setNotes(activeProject.description || "");
      setAppUrl(activeProject.url || "");
      setTone(activeProject.brandVoice || "founder-style");
      setSelectedChannels(activeProject.platforms || ["linkedin", "x"]);
    }
  }, [activeProject]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const ext = file.name.split(".").pop().toLowerCase();
      let category = "doc";
      if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
        category = "screenshot";
      } else if (["mp4", "mov", "webm", "avi"].includes(ext)) {
        category = "screen recording";
      }

      const url = URL.createObjectURL(file);
      const newFile = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        url,
        file
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });
  }

  function handleRemoveFile(id) {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  function getTabIcon(id, color) {
    switch (id) {
      case "manual": return <Icons.manual size={14} color={color} />;
      case "notes": return <Icons.notes size={14} color={color} />;
      case "url": return <Icons.url size={14} color={color} />;
      case "record": return <Icons.record size={14} color={color} />;
      case "screenshot": return <Icons.screenshot size={14} color={color} />;
      case "repo": return <Icons.repo size={14} color={color} />;
      default: return null;
    }
  }

  async function triggerGeneration() {
    setIsGenerating(true);
    setGenerationError("");
    setGenerationResult(null);

    // Prepare payload context
    const provider = aiSettings.defaultProvider || "template";
    const currentConfig = aiSettings[provider] || {};

    const payload = {
      project_name: activeProject?.name || "SignalFlow Project",
      notes: `${notes}\n\nAudience understands: ${audienceUnderstand}\nMain Value: ${mainValue}\nRecording Context: ${recordingNotes}`,
      audience: activeProject?.audience || "developers, founders",
      app_url: appUrl || activeProject?.url || "",
      generator: provider,
      channels: selectedChannels,
      output_types: selectedOutputs,
      document_text: pastedText,
      repo: sourceType === "repo" ? repoUrl : "",
      github_token: sourceType === "repo" ? githubToken : "",
      media_items: uploadedFiles.map(f => ({
        name: f.name,
        category: f.category,
        size: f.size,
        type: f.type,
        url: f.url
      })),
      providerApiKey: currentConfig.apiKey || "",
      providerBaseUrl: currentConfig.baseUrl || "",
      providerModelName: currentConfig.model || ""
    };

    if (sourceType === "url" && scrapeUrl) {
      payload.docs_url = scrapeUrl;
    }

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("signalflow_owner_token") || "" : "";
      const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

      const resp = await fetch("/api/launch_kit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload)
      });
      
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Package generation failed on the server.");
      }

      setGenerationResult(data);
    } catch (err) {
      console.error(err);
      setGenerationError(err.message || "An unexpected generation error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSaveDraft(editedPosts) {
    if (!generationResult) return;

    const finalPkg = {
      id: `pkg-${Date.now()}`,
      projectId: activeProject?.id || "default-project",
      title: title || `Launch Package - ${new Date().toLocaleDateString()}`,
      sourceType,
      sourceText: notes + " " + pastedText,
      sourceAssets: uploadedFiles.map(f => ({ name: f.name, category: f.category, url: f.url })),
      tone,
      goal: activeProject?.goals?.[0] || "launch",
      platforms: selectedChannels,
      outputs: selectedOutputs,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiProvider: aiSettings.defaultProvider,
      package: {
        ...generationResult.package,
        posts: {
          ...generationResult.package?.posts,
          ...editedPosts
        }
      },
      posts: {
        ...generationResult.posts,
        ...editedPosts
      },
      markdown: generationResult.markdown,
      image_base64: generationResult.image_base64
    };

    onSavePackage(finalPkg);
    setView("library");
  }

  // Active Provider text helper
  const providerMeta = MODEL_ROUTES_META.find(m => m.key === aiSettings.defaultProvider);

  if (generationResult) {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Review Generated Drafts</h2>
            <p style={styles.subtitle}>Modify drafts inline and publish or schedule them directly.</p>
          </div>
          <button onClick={() => setGenerationResult(null)} style={styles.cancelBtn}>
            ← Adjust Config
          </button>
        </div>
        <div style={styles.mainCard}>
          <PlatformPreviews
            generationResult={generationResult}
            onSave={handleSaveDraft}
            onCancel={() => setGenerationResult(null)}
            onPublishNow={onPublishNow}
            onSchedulePost={onSchedulePost}
            onExport={onExport}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hand-Drawn Animated Loader */}
      {isGenerating && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loaderCard} className="hand-drawn fade-in-up">
            {/* Drifting paper icons in background */}
            <div className="falling-paper-item" style={{ top: "-30px", left: "10%", animationDelay: "0s" }}>
              <Icons.notes size={20} color="var(--pastel-blue-border)" />
            </div>
            <div className="falling-paper-item" style={{ top: "-30px", left: "75%", animationDelay: "1.5s" }}>
              <Icons.manual size={18} color="var(--pastel-green-border)" />
            </div>
            <div className="falling-paper-item" style={{ top: "-30px", left: "45%", animationDelay: "2.8s" }}>
              <Icons.library size={22} color="var(--pastel-yellow-border)" />
            </div>

            {/* Drawing Animation */}
            <div style={styles.sketchContainer}>
              <svg viewBox="0 0 100 100" style={styles.sketchSvg}>
                {/* Clipboard */}
                <rect x="25" y="15" width="50" height="70" rx="4" fill="#fff" stroke="var(--ink-black)" strokeWidth="3" />
                <rect x="40" y="8" width="20" height="8" rx="2" fill="var(--pastel-yellow)" stroke="var(--ink-black)" strokeWidth="2.5" />
                
                {/* Sketch lines */}
                <line x1="35" y1="35" x2="65" y2="35" stroke="var(--ink-black)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="30" style={{ animation: "lineDraw 1.2s forwards 0.3s" }} />
                <line x1="35" y1="48" x2="60" y2="48" stroke="var(--ink-black)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="25" strokeDashoffset="25" style={{ animation: "lineDraw 1s forwards 1.2s" }} />
                <line x1="35" y1="61" x2="65" y2="61" stroke="var(--ink-black)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="30" strokeDashoffset="30" style={{ animation: "lineDraw 1.2s forwards 2s" }} />
              </svg>

              {/* Writing Pencil */}
              <div style={styles.animatedPencil}>
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ width: "32px", height: "32px", fill: "none", stroke: "var(--ink-black)", strokeWidth: 2.5 }}>
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </div>
            </div>

            <h3 style={styles.loaderTitle} className="handwritten">Drafting launch packages...</h3>
            <p style={styles.loaderStatus}>{loadingStatus}</p>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Studio Workspace</h2>
          <p style={styles.subtitle}>Describe update once, select outlets, and generate cross-platform packages instantly.</p>
        </div>
        
        <div style={styles.headerActions}>
          {providerMeta && (
            <div style={styles.activeModelBadge} className="hand-drawn">
              <span style={styles.modelDot} />
              <span>AI Engine: <strong>{providerMeta.title}</strong></span>
            </div>
          )}
          <button
            onClick={currentStep === 1 ? () => setCurrentStep(2) : triggerGeneration}
            disabled={currentStep === 1 ? !notes.trim() : (isGenerating || !notes.trim())}
            style={{
              ...styles.primaryGenerateBtn,
              ...((currentStep === 1 ? !notes.trim() : (isGenerating || !notes.trim())) ? styles.primaryGenerateBtnDisabled : {})
            }}
            className="hand-drawn-btn"
          >
            {currentStep === 1 ? "Next: Tune Settings ➜" : (isGenerating ? "🤖 Synthesizing..." : "Synthesize Drafts ✦")}
          </button>
        </div>
      </div>

      {generationError && (
        <div style={styles.errorAlert} className="hand-drawn">
          <strong>Generation Error:</strong> {generationError}
          <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
            Verify API key configs in the Settings panel or try the offline fallback model.
          </p>
        </div>
      )}

      {/* 2-Step Creative Pipeline */}
      <div style={{ ...styles.workspaceBody, gridTemplateColumns: "1fr" }}>
        {currentStep === 1 && (
          /* Left Column: Context & Input sources */
          <div style={styles.leftCol}>
            <div style={styles.workspaceCard} className="hand-drawn offset-border">
              
              {/* ALWAYS VISIBLE context textarea (Notebook Ruled Sheet) */}
              <div style={styles.formCol}>
                <label style={styles.label} className="handwritten">✍️ Tell us what you built / released *</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    ...styles.textarea,
                    minHeight: "220px",
                    backgroundImage: "linear-gradient(rgba(36, 113, 93, 0.07) 1px, transparent 1px)",
                    backgroundSize: "100% 28px",
                    lineHeight: "28px",
                    backgroundAttachment: "local",
                    padding: "14px 20px",
                    fontSize: "15px",
                    backgroundColor: "#fffdf9"
                  }}
                  placeholder="Draft release updates, list key features, or write down raw launch details here..."
                  required
                  className="hand-drawn-input"
                />
              </div>

              {/* Attachment Tray */}
              <div style={{ marginTop: "20px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink-black)", display: "block", marginBottom: "8px" }} className="handwritten">
                  📎 Attach optional context material:
                </span>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { id: "notes", label: "Changelog / Code", icon: "notes" },
                    { id: "url", label: "Website Link", icon: "url" },
                    { id: "record", label: "Record Screen", icon: "record" },
                    { id: "screenshot", label: "Upload Mockups", icon: "screenshot" },
                    { id: "repo", label: "Scan Repo", icon: "repo" }
                  ].map(tab => {
                    const isActive = sourceType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSourceType(sourceType === tab.id ? null : tab.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          background: isActive ? "var(--pastel-yellow)" : "#fff",
                          border: "2px solid var(--ink-black)",
                          cursor: "pointer",
                          fontWeight: "700"
                        }}
                        className="hand-drawn-btn"
                      >
                        {getTabIcon(tab.id, "var(--ink-black)")}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic input panels based on selection */}
              {sourceType && (
                <div style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#faf9f6",
                  border: "2px dashed var(--ink-black)",
                  borderRadius: "10px"
                }} className="hand-drawn-wavy">
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800" }} className="handwritten">
                      Attachment Config: {sourceType.toUpperCase()}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSourceType(null)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                    >
                      ✕ Clear
                    </button>
                  </div>

                  {sourceType === "notes" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Paste Notes, Raw Code or Changelog Text</label>
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        style={{ ...styles.textarea, minHeight: "120px" }}
                        placeholder="Paste feature details, markdown readme files, logs or package files..."
                        rows={4}
                        className="hand-drawn-input"
                      />
                    </div>
                  )}

                  {sourceType === "url" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Website App or Documentation Link</label>
                      <input
                        type="url"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        style={styles.input}
                        placeholder="https://myproduct.com/docs"
                        className="hand-drawn-input"
                      />
                    </div>
                  )}

                  {sourceType === "record" && (
                    <div style={styles.recordingSection}>
                      <label style={styles.label}>🎙️ Capture Interactive Screencast Demo</label>
                      <p style={styles.panelTip}>Use clean resolution tabs. Toggle the microphone button if you want to transcribe feature voice overs directly into generator prompts.</p>
                      
                      <div style={styles.recorderControls}>
                        {captureStatus === "idle" && (
                          <button type="button" onClick={startRecording} style={styles.recordStartBtn} className="hand-drawn-btn">
                            🔴 Record Walkthrough Screen
                          </button>
                        )}
                        
                        {captureStatus === "recording" && (
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button type="button" onClick={stopRecording} style={styles.recordStopBtn} className="hand-drawn-btn">
                              ⏹️ Stop Screen Record
                            </button>
                            <button type="button" onClick={captureFrame} style={styles.frameCaptureBtn} className="hand-drawn-btn">
                              📸 Capture Frame
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <label style={{ ...styles.checkboxLabel, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={micEnabled}
                            onChange={(e) => setMicEnabled(e.target.checked)}
                            disabled={captureStatus === "recording"}
                            style={{ cursor: "pointer" }}
                          />
                          Enable Audio Voice Transcription (Microphone input)
                        </label>
                      </div>

                      {showRecordingNotesForm && (
                        <div style={styles.recordingNotesBox}>
                          <label style={styles.label}>Walkthrough Design Notes & Insights</label>
                          <textarea
                            value={recordingNotes}
                            onChange={(e) => setRecordingNotes(e.target.value)}
                            style={styles.textarea}
                            placeholder="What makes this walkthrough cool? Mention highlights (e.g. key interactions, colors, animations) to steer social caption designs."
                            rows={2}
                            className="hand-drawn-input"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {sourceType === "screenshot" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Drop Interactive Mockups, Wireframes or Screenshots</label>
                      <div style={styles.fileUploadBox} className="hand-drawn-wavy" onClick={() => document.getElementById("file-upload-input").click()}>
                        <input
                          id="file-upload-input"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                        <div style={styles.uploadLabel}>
                          <Icons.screenshot size={32} color="var(--ink-black)" />
                          <span>Click to upload mockup screenshots or walkthrough videos</span>
                          <span style={{ fontSize: "10px", color: "#aaa" }}>PNG, JPG, WebP, MP4 up to 15MB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {sourceType === "repo" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Scan Repository Directory Path / GitHub URL</label>
                      <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. https://github.com/Ankit6149/SignalFlow-Studio or C:\workspace\app"
                        className="hand-drawn-input"
                      />
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={styles.label}>GitHub Access Token (Optional, for private repos)</label>
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          style={styles.input}
                          placeholder="ghp_..."
                          className="hand-drawn-input"
                        />
                      </div>
                      <p style={styles.panelTip}>💻 Local directories read and filter structural source files from your disk. GitHub URLs pull files securely via their public/authorized API tree.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ingested assets display */}
              {uploadedFiles.length > 0 && (
                <div style={styles.assetsList}>
                  <h4 style={styles.assetsListTitle}>Ingested Assets ({uploadedFiles.length})</h4>
                  <div style={styles.assetsGrid}>
                    {uploadedFiles.map(file => (
                      <div key={file.id} style={styles.assetItem} className="hand-drawn">
                        <span style={styles.assetCategoryIcon}>
                          {file.category === "screenshot" ? "🖼️" : "🎥"}
                        </span>
                        <div style={styles.assetDetails}>
                          <span style={styles.assetName}>{file.name}</span>
                          <span style={styles.assetSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button onClick={() => handleRemoveFile(file.id)} style={styles.removeAssetBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!notes.trim()}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "10px",
                    background: notes.trim() ? "var(--pastel-yellow)" : "#e5e5e0",
                    color: notes.trim() ? "var(--ink-black)" : "#aaa",
                    fontWeight: "600",
                    cursor: notes.trim() ? "pointer" : "not-allowed",
                    opacity: notes.trim() ? 1 : 0.6
                  }}
                  className="hand-drawn-btn"
                >
                  Next: Tune Settings & Outlets ➜
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          /* Right Column: Creative brand tuners */
          <div style={styles.rightCol}>
            <div style={styles.workspaceCard} className="hand-drawn offset-border">
              <div style={styles.cardHeader}>
                <h3 style={styles.cardSectionTitle}>2. Target Settings & Tuning</h3>
                <span style={styles.stepHint}>Configure voice & platforms</span>
              </div>

              <div style={styles.form}>
                <div style={styles.formCol}>
                  <label style={styles.label}>Draft Package Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Launch Kit v1.0"
                    className="hand-drawn-input"
                  />
                </div>

                <div style={styles.formCol}>
                  <label style={styles.label}>Brand Voice Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={styles.select}
                    className="hand-drawn-input"
                  >
                    {TONE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--ink-black)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "left",
                    padding: "4px 0",
                    margin: "8px 0",
                    display: "block",
                    fontFamily: "inherit"
                  }}
                  className="handwritten"
                >
                  {showAdvancedTuning ? "✦ Hide Advanced Details" : "✦ Add advanced details (optional)"}
                </button>

                {showAdvancedTuning && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "14px", border: "2px solid var(--ink-black)", background: "var(--bg-cream)", borderRadius: "8px" }}>
                    <div style={styles.formCol}>
                      <label style={styles.label}>Application URL (optional)</label>
                      <input
                        type="url"
                        value={appUrl}
                        onChange={(e) => setAppUrl(e.target.value)}
                        style={styles.input}
                        placeholder="https://acme.io"
                        className="hand-drawn-input"
                      />
                    </div>

                    <div style={styles.formCol}>
                      <label style={styles.label}>Primary Value Proposition (Value Hook)</label>
                      <input
                        type="text"
                        value={mainValue}
                        onChange={(e) => setMainValue(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. Saves developers 10 hours a week"
                        className="hand-drawn-input"
                      />
                    </div>

                    <div style={styles.formCol}>
                      <label style={styles.label}>Key Target Audience Message</label>
                      <input
                        type="text"
                        value={audienceUnderstand}
                        onChange={(e) => setAudienceUnderstand(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. It is completely client-side and private"
                        className="hand-drawn-input"
                      />
                    </div>
                  </div>
                )}

                {/* Target Channels Visual Pills */}
                <div style={styles.formCol}>
                  <label style={styles.label}>Target Outlets</label>
                  <div style={styles.channelPillsContainer}>
                    {CHANNELS.map(([key, label, emoji, color]) => {
                      const isSelected = selectedChannels.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedChannels(prev =>
                              prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
                            );
                          }}
                          style={{
                            ...styles.channelPill,
                            ...(isSelected ? {
                              background: color ? `${color}12` : "rgba(45, 106, 79, 0.08)",
                              borderColor: "var(--ink-black)",
                              color: color || "#2d6a4f",
                              fontWeight: "600",
                              transform: "scale(1.02)",
                              borderWidth: "2px"
                            } : {})
                          }}
                          className={isSelected ? "hand-drawn" : ""}
                        >
                          <span style={{ marginRight: "6px", display: "inline-flex", alignItems: "center" }}>
                            {Icons[key] ? Icons[key]({ size: 13, color: isSelected ? color : "#6b6b6b" }) : emoji}
                          </span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Output Formats Pills */}
                <div style={styles.formCol}>
                  <label style={styles.label}>Required Package Outputs</label>
                  <div style={styles.formatPillsContainer}>
                    {OUTPUT_TYPES.map(([key, label]) => {
                      const isSelected = selectedOutputs.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedOutputs(prev =>
                              prev.includes(key) ? prev.filter(o => o !== key) : [...prev, key]
                            );
                          }}
                          style={{
                            ...styles.formatPill,
                            ...(isSelected ? {
                              ...styles.formatPillActive,
                              borderColor: "var(--ink-black)",
                              borderWidth: "2px"
                            } : {})
                          }}
                          className={isSelected ? "hand-drawn" : ""}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: "#fff",
                    color: "var(--ink-black)",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                  className="hand-drawn-btn"
                >
                  ← Back to Context Brief
                </button>

                <button
                  onClick={triggerGeneration}
                  disabled={isGenerating || !notes.trim()}
                  style={{
                    ...styles.primaryGenerateBtn,
                    padding: "12px 28px",
                    ...((isGenerating || !notes.trim()) ? styles.primaryGenerateBtnDisabled : {})
                  }}
                  className="hand-drawn-btn"
                >
                  {isGenerating ? "🤖 Synthesizing..." : "Synthesize Drafts ✦"}
                </button>
              </div>
            </div>
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
    flexGrow: 1,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: "#faf9f6"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0,
    letterSpacing: "-0.3px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "4px 0 0 0"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  activeModelBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#6b6b6b"
  },
  modelDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#2d6a4f",
    animation: "pulse-dot 2s infinite ease-in-out"
  },
  primaryGenerateBtn: {
    background: "linear-gradient(135deg, #2d6a4f, #52b788)",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(45, 106, 79, 0.2)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  primaryGenerateBtnDisabled: {
    background: "#e5e5e0",
    color: "#aaa",
    cursor: "not-allowed",
    boxShadow: "none"
  },
  errorAlert: {
    padding: "14px 18px",
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    borderRadius: "10px",
    color: "#ef4444",
    fontSize: "13px",
    lineHeight: "1.5"
  },
  workspaceBody: {
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
  workspaceCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.015)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardSectionTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: 0
  },
  stepHint: {
    fontSize: "11px",
    color: "#aaa",
    fontWeight: "500"
  },
  tabBar: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    background: "#faf9f6",
    padding: "6px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.04)"
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px 8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#6b6b6b",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit"
  },
  tabBtnActive: {
    background: "#fff",
    color: "#2d6a4f",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)"
  },
  tabIcon: {
    fontSize: "14px"
  },
  tabContentPanel: {
    background: "#faf9f6",
    borderRadius: "12px",
    padding: "18px",
    border: "1px solid rgba(0,0,0,0.04)",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  emptyBriefState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#aaa",
    padding: "12px",
    gap: "8px",
    fontSize: "13px"
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  input: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#1a1a1a",
    outline: "none",
    fontSize: "13px",
    transition: "border-color 0.2s ease"
  },
  select: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#1a1a1a",
    outline: "none",
    fontSize: "13px",
    cursor: "pointer"
  },
  textarea: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#1a1a1a",
    outline: "none",
    fontSize: "13px",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.5",
    transition: "border-color 0.2s ease"
  },
  panelTip: {
    fontSize: "11px",
    color: "#888",
    margin: "6px 0 0 0",
    lineHeight: "1.4"
  },
  channelPillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px"
  },
  channelPill: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b6b6b",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit"
  },
  formatPillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px"
  },
  formatPill: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b6b6b",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit"
  },
  formatPillActive: {
    background: "rgba(45, 106, 79, 0.08)",
    borderColor: "#2d6a4f",
    color: "#2d6a4f",
    fontWeight: "600"
  },
  recorderWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  recordControls: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  btnGroup: {
    display: "flex",
    gap: "10px"
  },
  recordBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer"
  },
  stopBtn: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer"
  },
  screenshotBtn: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer"
  },
  micToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#6b6b6b",
    cursor: "pointer"
  },
  statusRow: {
    fontSize: "11px",
    color: "#888"
  },
  statusText: {
    fontWeight: "600",
    color: "#2d6a4f"
  },
  errorText: {
    fontSize: "11px",
    color: "#ef4444"
  },
  previewBox: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#1a1a1a",
    borderRadius: "8px",
    overflow: "hidden"
  },
  videoPreview: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  },
  recordingNotesBox: {
    borderTop: "1px solid rgba(0,0,0,0.06)",
    paddingTop: "12px",
    marginTop: "4px"
  },
  recordingNotesTitle: {
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  fileUploadBox: {
    border: "2px dashed rgba(0,0,0,0.1)",
    borderRadius: "10px",
    padding: "30px 16px",
    textAlign: "center",
    cursor: "pointer"
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "#6b6b6b",
    fontSize: "12px",
    cursor: "pointer"
  },
  assetsList: {
    borderTop: "1px solid rgba(0,0,0,0.06)",
    paddingTop: "14px",
    marginTop: "10px"
  },
  assetsListTitle: {
    fontSize: "13px",
    fontWeight: "700",
    margin: "0 0 8px 0"
  },
  assetsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  assetItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    background: "#faf9f6",
    borderRadius: "8px",
    border: "1px solid rgba(0,0,0,0.04)"
  },
  assetCategoryIcon: {
    fontSize: "16px"
  },
  assetDetails: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  assetName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1a1a1a"
  },
  assetSize: {
    fontSize: "10px",
    color: "#aaa"
  },
  removeAssetBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12px"
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "#1a1a1a",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit"
  },
  mainCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.015)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  loaderOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    background: "rgba(251, 249, 244, 0.82)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loaderCard: {
    width: "400px",
    background: "#fff",
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
    overflow: "hidden"
  },
  sketchContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    marginBottom: "20px"
  },
  sketchSvg: {
    width: "100%",
    height: "100%"
  },
  animatedPencil: {
    position: "absolute",
    top: "35px",
    left: "55px",
    width: "32px",
    height: "32px",
    transformOrigin: "bottom left",
    animation: "pencilWrite 1.8s ease-in-out infinite"
  },
  loaderTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "var(--ink-black)",
    margin: "0 0 10px 0"
  },
  loaderStatus: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
    fontWeight: "500"
  }
};
