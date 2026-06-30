import React, { useState, useEffect, useRef } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { CHANNELS, OUTPUT_TYPES, MODEL_ROUTES_META } from "../lib/config";
import PlatformPreviews from "./PlatformPreviews";

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
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState(initialSource); // "manual", "record", "screenshot", "video", "url", "notes"
  
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
      // Provider credentials passed securely to local-first server API
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
      setStep(4);
    } catch (err) {
      console.error(err);
      setGenerationError(err.message || "An unexpected generation error occurred.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSaveDraft(editedPosts) {
    if (!generationResult) return;

    // Merge changes
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

  return (
    <div style={styles.container}>
      {/* Step Progress bar */}
      <div style={styles.stepper}>
        {[1, 2, 3, 4].map(s => {
          const isActive = step === s;
          const isDone = step > s;
          return (
            <div key={s} style={styles.stepItem}>
              <div style={{
                ...styles.stepCircle,
                ...(isActive ? styles.stepCircleActive : {}),
                ...(isDone ? styles.stepCircleDone : {})
              }}>
                {isDone ? "✓" : s}
              </div>
              <span style={{
                ...styles.stepLabel,
                ...(isActive ? styles.stepLabelActive : {})
              }}>
                {s === 1 && "Choose Source"}
                {s === 2 && "Configure Tone"}
                {s === 3 && "Confirm Context"}
                {s === 4 && "Review Outputs"}
              </span>
            </div>
          );
        })}
      </div>

      <div style={styles.mainCard}>
        {/* STEP 1: CHOOSE SOURCE */}
        {step === 1 && (
          <div>
            <h3 style={styles.sectionTitle}>Step 1: Choose Source Material</h3>
            <p style={styles.sectionDesc}>SignalFlow compiles content packages by analyzing specific codebase directories, walkthrough screens, design assets, or custom text briefs.</p>

            <div style={styles.sourceGrid}>
              {[
                { id: "manual", label: "Manual Brief", icon: "✍", desc: "Write features and value points manually" },
                { id: "record", label: "Screen Recorder", icon: "🎥", desc: "Record tab sharing with native audio" },
                { id: "screenshot", label: "Upload Image", icon: "🖼", desc: "Ingest mockup design assets" },
                { id: "url", label: "Paste Website URL", icon: "🔗", desc: "Scrape pages and product documentation" },
                { id: "notes", label: "Changelog / Code", icon: "📝", desc: "Paste release text notes or source files" },
                { id: "repo", label: "Scan Code Repository", icon: "💻", desc: "Ingest GitHub URL or local workspace path" }
              ].map(src => (
                <div
                  key={src.id}
                  onClick={() => setSourceType(src.id)}
                  style={{
                    ...styles.sourceCard,
                    ...(sourceType === src.id ? styles.sourceCardSelected : {})
                  }}
                >
                  <span style={styles.sourceIcon}>{src.icon}</span>
                  <div style={styles.sourceInfo}>
                    <span style={styles.sourceLabel}>{src.label}</span>
                    <span style={styles.sourceDesc}>{src.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Source Details Dynamic Forms */}
            <div style={styles.sourcePanel}>
              {sourceType === "manual" && (
                <p style={styles.panelTip}>📝 Enter your project details on the next step to trigger the prompt engine.</p>
              )}

              {sourceType === "record" && (
                <div style={styles.recorderWrapper}>
                  <div style={styles.recordControls}>
                    <div style={styles.btnGroup}>
                      {captureStatus === "Recording" ? (
                        <button onClick={stopRecording} style={styles.stopBtn}>
                          🛑 Stop Recording
                        </button>
                      ) : (
                        <button
                          onClick={() => startRecording(videoPreviewRef.current)}
                          disabled={captureStatus === "Starting..."}
                          style={styles.recordBtn}
                        >
                          🎥 Start Walkthrough Capture
                        </button>
                      )}
                      
                      <button
                        onClick={() => captureFrame(videoPreviewRef.current)}
                        disabled={captureStatus !== "Recording"}
                        style={styles.screenshotBtn}
                      >
                        📸 Take Screenshot Frame
                      </button>
                    </div>

                    <label style={styles.micToggle}>
                      <input
                        type="checkbox"
                        checked={micEnabled}
                        onChange={(e) => setMicEnabled(e.target.checked)}
                      />
                      🎤 Include Microphone Voiceover
                    </label>

                    <div style={styles.statusRow}>
                      Status: <span style={styles.statusText}>{captureStatus}</span>
                    </div>

                    {recorderError && <p style={styles.errorText}>Error: {recorderError}</p>}
                  </div>

                  <div style={styles.previewBox}>
                    <video
                      ref={videoPreviewRef}
                      style={styles.videoPreview}
                      muted
                      playsInline
                    />
                  </div>

                  {showRecordingNotesForm && (
                    <div style={styles.recordingNotesBox}>
                      <h4 style={styles.recordingNotesTitle}>📝 Describe your Walkthrough</h4>
                      <div style={styles.formCol}>
                        <label style={styles.label}>What features did you showcase in this recording?</label>
                        <textarea
                          value={recordingNotes}
                          onChange={(e) => setRecordingNotes(e.target.value)}
                          style={styles.textarea}
                          placeholder="e.g. I showed the database dashboard sync button and configuration keys setup."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {sourceType === "screenshot" && (
                <div style={styles.fileUploadBox}>
                  <label style={styles.uploadLabel}>
                    <span style={{ fontSize: "32px" }}>📁</span>
                    <span>Click or drag mockups to upload screenshots/videos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}

              {sourceType === "url" && (
                <div style={styles.formCol}>
                  <label style={styles.label}>Website App or Documentation Links (comma separated)</label>
                  <input
                    type="url"
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    style={styles.input}
                    placeholder="https://myproduct.com/docs"
                  />
                  <p style={styles.panelTip}>🔗 SignalFlow will scan and extract core positioning text from public web URL links.</p>
                </div>
              )}

              {sourceType === "notes" && (
                <div style={styles.formCol}>
                  <label style={styles.label}>Paste Notes, Raw Code or Changelog Text</label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    style={styles.textarea}
                    placeholder="Paste feature details, markdown readme files, logs or package files..."
                    rows={6}
                  />
                </div>
              )}

              {sourceType === "repo" && (
                <div style={styles.formCol}>
                  <label style={styles.label}>Repository GitHub URL or Local Workspace Folder Path</label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. https://github.com/Ankit6149/SignalFlow-Studio or C:\workspace\app"
                  />
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={styles.label}>GitHub Access Token (Optional, for private repos)</label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      style={styles.input}
                      placeholder="ghp_..."
                    />
                  </div>
                  <p style={styles.panelTip}>💻 Local directories read and filter structural source files from your disk. GitHub URLs pull files securely via their public/authorized API tree.</p>
                </div>
              )}

              {/* Uploaded assets quick preview */}
              {uploadedFiles.length > 0 && (
                <div style={styles.assetsList}>
                  <h4 style={styles.assetsListTitle}>Ingested Assets ({uploadedFiles.length})</h4>
                  <div style={styles.assetsGrid}>
                    {uploadedFiles.map(file => (
                      <div key={file.id} style={styles.assetItem}>
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
            </div>

            <div style={styles.formActions}>
              <button onClick={() => setStep(2)} style={styles.primaryBtn}>Next: Configure Details</button>
              <button onClick={() => setView("dashboard")} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURE TONE */}
        {step === 2 && (
          <div>
            <h3 style={styles.sectionTitle}>Step 2: Brand Tone & Core Positioning</h3>
            <p style={styles.sectionDesc}>Select platform goals and adjust parameters to shape the generated writing patterns.</p>

            <div style={styles.form}>
              <div style={styles.formCol}>
                <label style={styles.label}>Package Title Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. Launch Kit v1.0"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <label style={styles.label}>Target Brand Voice Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={styles.input}
                  >
                    {TONE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formCol}>
                  <label style={styles.label}>Live Application URL (if different from profile)</label>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    style={styles.input}
                    placeholder="https://acme.io"
                  />
                </div>
              </div>

              <div style={styles.formCol}>
                <label style={styles.label}>What did you build? (Description of updates/release)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.textarea}
                  placeholder="Describe details of the update, launch, or code implementation."
                  rows={4}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <label style={styles.label}>What is the primary value proposition? (Value Hook)</label>
                  <input
                    type="text"
                    value={mainValue}
                    onChange={(e) => setMainValue(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Saves developers 10 hours a week by automating code package creation."
                  />
                </div>
                <div style={styles.formCol}>
                  <label style={styles.label}>What should the target audience understand? (Key Message)</label>
                  <input
                    type="text"
                    value={audienceUnderstand}
                    onChange={(e) => setAudienceUnderstand(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. It is completely client-side, local-first and does not save secret keys on servers."
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button onClick={() => setStep(3)} style={styles.primaryBtn}>Next: Set Channels</button>
                <button onClick={() => setStep(1)} style={styles.cancelBtn}>Back</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM CONTEXT & CHANNELS */}
        {step === 3 && (
          <div>
            <h3 style={styles.sectionTitle}>Step 3: Output Channels & Formats</h3>
            <p style={styles.sectionDesc}>Filter targeted social pipelines and document types before starting AI generations.</p>

            <div style={styles.form}>
              <div style={styles.formCol}>
                <label style={styles.label}>Target Channels</label>
                <div style={styles.checkboxGroup}>
                  {CHANNELS.map(([key, label, emoji]) => (
                    <label key={key} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(key)}
                        onChange={() => {
                          setSelectedChannels(prev =>
                            prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
                          );
                        }}
                        style={styles.checkbox}
                      />
                      {emoji} {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formCol}>
                <label style={styles.label}>Required Output Formats</label>
                <div style={styles.checkboxGroup}>
                  {OUTPUT_TYPES.map(([key, label]) => (
                    <label key={key} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedOutputs.includes(key)}
                        onChange={() => {
                          setSelectedOutputs(prev =>
                            prev.includes(key) ? prev.filter(o => o !== key) : [...prev, key]
                          );
                        }}
                        style={styles.checkbox}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Indicator */}
              <div style={styles.modelMetaIndicator}>
                <div style={styles.indicatorLabel}>Active Model Provider:</div>
                <div style={styles.indicatorVal}>
                  {MODEL_ROUTES_META.find(m => m.key === aiSettings.defaultProvider)?.title || aiSettings.defaultProvider}
                </div>
              </div>

              {generationError && (
                <div style={styles.errorAlert}>
                  <strong>Generation Error:</strong> {generationError}
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
                    Verify API key configs in the Settings panel or switch to SignalFlow AI (Demo mode) to try offline fallback.
                  </p>
                </div>
              )}

              <div style={styles.formActions}>
                <button
                  onClick={triggerGeneration}
                  disabled={isGenerating}
                  style={styles.primaryBtn}
                >
                  {isGenerating ? "🤖 Synthesizing Package..." : "🚀 Generate Content Package"}
                </button>
                <button onClick={() => setStep(2)} style={styles.cancelBtn}>Back</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SAVE */}
        {step === 4 && generationResult && (
          <PlatformPreviews
            generationResult={generationResult}
            onSave={handleSaveDraft}
            onCancel={() => setStep(3)}
            onPublishNow={onPublishNow}
            onSchedulePost={onSchedulePost}
            onExport={onExport}
          />
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
  stepper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  stepCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "rgba(18, 22, 18, 0.04)",
    color: "#59635c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px"
  },
  stepCircleActive: {
    background: "#ec6f4f",
    color: "#fff"
  },
  stepCircleDone: {
    background: "rgba(36, 113, 93, 0.1)",
    color: "#24715d",
    border: "1px solid rgba(36, 113, 93, 0.2)"
  },
  stepLabel: {
    fontSize: "13px",
    color: "#59635c",
    fontWeight: "500"
  },
  stepLabelActive: {
    color: "#121612",
    fontWeight: "700"
  },
  mainCard: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 30px rgba(18, 22, 18, 0.02)"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: "0 0 8px 0"
  },
  sectionDesc: {
    fontSize: "14px",
    color: "#59635c",
    margin: "0 0 24px 0",
    lineHeight: "1.5"
  },
  sourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px"
  },
  sourceCard: {
    padding: "20px",
    background: "rgba(18, 22, 18, 0.02)",
    border: "1px solid rgba(18, 22, 18, 0.06)",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    transition: "all 0.2s ease"
  },
  sourceCardSelected: {
    borderColor: "#24715d",
    background: "rgba(36, 113, 93, 0.08)"
  },
  sourceIcon: {
    fontSize: "24px"
  },
  sourceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  sourceLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612"
  },
  sourceDesc: {
    fontSize: "11px",
    color: "#59635c",
    lineHeight: "1.4"
  },
  sourcePanel: {
    background: "rgba(18, 22, 18, 0.02)",
    borderRadius: "14px",
    padding: "24px",
    border: "1px solid rgba(18, 22, 18, 0.06)",
    marginBottom: "24px"
  },
  panelTip: {
    fontSize: "13px",
    color: "#59635c",
    margin: 0
  },
  recorderWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  recordControls: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  btnGroup: {
    display: "flex",
    gap: "12px"
  },
  recordBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },
  stopBtn: {
    background: "rgba(18, 22, 18, 0.08)",
    color: "#121612",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },
  screenshotBtn: {
    background: "#24715d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },
  micToggle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#59635c",
    cursor: "pointer",
    marginTop: "4px"
  },
  statusRow: {
    fontSize: "13px",
    color: "#59635c"
  },
  statusText: {
    fontWeight: "700",
    color: "#24715d"
  },
  errorText: {
    fontSize: "13px",
    color: "#f43f5e",
    margin: 0
  },
  previewBox: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#121612",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid rgba(18, 22, 18, 0.08)"
  },
  videoPreview: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  },
  recordingNotesBox: {
    marginTop: "16px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "16px"
  },
  recordingNotesTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612",
    margin: "0 0 12px 0"
  },
  fileUploadBox: {
    border: "2px dashed rgba(18, 22, 18, 0.2)",
    borderRadius: "12px",
    padding: "40px 20px",
    textAlign: "center",
    cursor: "pointer"
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "#59635c",
    fontSize: "14px",
    cursor: "pointer"
  },
  assetsList: {
    marginTop: "20px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "16px"
  },
  assetsListTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#121612",
    margin: "0 0 12px 0"
  },
  assetsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  assetItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 16px",
    background: "rgba(18, 22, 18, 0.02)",
    borderRadius: "8px",
    border: "1px solid rgba(18, 22, 18, 0.06)"
  },
  assetCategoryIcon: {
    fontSize: "18px"
  },
  assetDetails: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center"
  },
  assetName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#121612"
  },
  assetSize: {
    fontSize: "11px",
    color: "#64748b"
  },
  removeAssetBtn: {
    background: "transparent",
    border: "none",
    color: "#f43f5e",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
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
  modelMetaIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "rgba(36, 113, 93, 0.06)",
    border: "1px solid rgba(36, 113, 93, 0.12)",
    borderRadius: "8px"
  },
  indicatorLabel: {
    fontSize: "12px",
    color: "#59635c",
    fontWeight: "500"
  },
  indicatorVal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#24715d"
  },
  errorAlert: {
    padding: "16px",
    background: "rgba(244, 63, 94, 0.08)",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    borderRadius: "8px",
    color: "#f43f5e",
    fontSize: "14px"
  },
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "20px"
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
