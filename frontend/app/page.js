"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";
const PRODUCT_NAME = "SignalFlow Studio";
const ACCESS_TOKEN_STORAGE_KEY = "signalflow_owner_token";

const MODEL_ROUTES_META = [
  { key: "prompt", title: "Prompt only", desc: "Generates a copyable chatbot instruction prompt.", use: "No API keys needed. Free chatbots.", badge: "Local", price: "Free" },
  { key: "template", title: "Template fallback", desc: "Deterministic offline template rules generator.", use: "Fully offline, fast, zero AI calls.", badge: "Local", price: "Free" },
  { key: "gemini", title: "Google Gemini", desc: "Native Gemini completions via official BYOK.", use: "Best for structured code & readme context.", badge: "Cloud", price: "BYOK" },
  { key: "groq", title: "Groq Cloud", desc: "Ultra-low-latency open weights completions.", use: "Speedy text and outline synthesis.", badge: "Cloud", price: "BYOK" },
  { key: "openrouter", title: "OpenRouter Gateway", desc: "Access open-source and paid models globally.", use: "Access diverse models under one key.", badge: "Cloud", price: "BYOK" },
  { key: "ollama", title: "Local Ollama", desc: "Runs on your machine at port 11434.", use: "Privacy-centric local generation.", badge: "Local", price: "Free/Local" },
  { key: "lmstudio", title: "LM Studio API", desc: "Runs local models at port 1234.", use: "Privacy-centric local model testing.", badge: "Local", price: "Free/Local" },
  { key: "custom", title: "Custom Gateway", desc: "OpenAI-compatible gateway connection.", use: "Your corporate endpoint or custom API.", badge: "Cloud", price: "BYOK" }
];

const CHANNELS = [
  ["linkedin", "LinkedIn"],
  ["x", "X"],
  ["instagram", "Instagram"],
  ["reddit", "Reddit"],
  ["hn", "Hacker News"],
  ["blog", "Blog"],
  ["newsletter", "Newsletter"],
  ["release_notes", "Release notes"]
];

const OUTPUT_TYPES = [
  ["caption", "Captions"],
  ["text", "Platform Posts"],
  ["thread", "X Threads"],
  ["image", "Visual Plan"],
  ["video", "Video Scripts"],
  ["carousel", "Carousel Layouts"],
  ["doc", "Briefs & Checklist"]
];

const STEPS = ["Model", "Inputs", "Outputs", "Package"];

const DEFAULT_RESULT = {
  project_name: PRODUCT_NAME,
  posts: {
    linkedin: "Connect a model, add context, choose outputs, and generate a ready-to-review package.",
  },
  channels: ["linkedin"],
  outputs: ["caption", "text", "doc"],
  markdown: `# ${PRODUCT_NAME} package\n\nYour generated package will appear here.`,
  media_plan: [
    {
      type: "screenshot",
      title: "Visual direction",
      summary: "A generated social image or screenshot direction appears after generation.",
    },
  ],
  documents: [],
  assets: {
    markdown: "post-package.md",
    summary: "post-package.json",
    code_image: "post-card.svg",
  },
  image_base64: ""
};

export default function Home() {
  const videoPreviewRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [step, setStep] = useState(0);
  const [modelRoute, setModelRoute] = useState("prompt");
  const [modelEndpoint, setModelEndpoint] = useState("");
  const [modelName, setModelName] = useState("");
  
  // Ingest config status from backend
  const [providerConfigs, setProviderConfigs] = useState({});
  const [loadingStatus, setLoadingStatus] = useState("");
  
  const [projectName, setProjectName] = useState("SignalFlow Studio");
  const [brief, setBrief] = useState("");
  const [links, setLinks] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [enableAutoCapture, setEnableAutoCapture] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [selectedChannels, setSelectedChannels] = useState(["linkedin", "x", "instagram", "newsletter", "release_notes"]);
  const [selectedOutputs, setSelectedOutputs] = useState(["caption", "text", "image", "video", "carousel", "doc"]);
  const [audience, setAudience] = useState("developers, builders, and creators");
  const [accessLocked, setAccessLocked] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(DEFAULT_RESULT);
  const [activeChannel, setActiveChannel] = useState("linkedin");
  const [copiedLabel, setCopiedLabel] = useState("");
  const [captureStatus, setCaptureStatus] = useState("Ready");
  const [hasGenerated, setHasGenerated] = useState(false);

  const [publishPlatform, setPublishPlatform] = useState("linkedin");
  const [isPublishingToApi, setIsPublishingToApi] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState("");

  const isPublishConfigured = useMemo(() => {
    const config = result?.integration_config?.platforms?.[publishPlatform] || {};
    return Boolean(config.configured);
  }, [result, publishPlatform]);

  async function handlePublishAction() {
    setPublishStatusMsg("");
    const contentText = result?.posts?.[publishPlatform] || "";
    if (!contentText) {
      setPublishStatusMsg("Error: No draft content compiled for this platform.");
      return;
    }

    if (!isPublishConfigured) {
      setPublishStatusMsg(`API credentials not configured for ${publishPlatform}. Please use the manual flow (Copy to Clipboard, Download ZIP) or configure your environment variables.`);
      return;
    }

    const platformLabel = publishPlatform.toUpperCase();
    const confirmed = window.confirm(`Are you sure you want to officially publish the draft to ${platformLabel}?\n\nContent:\n${contentText.substring(0, 150)}...`);
    if (!confirmed) {
      return;
    }

    setIsPublishingToApi(true);
    setPublishStatusMsg("Submitting post payload to server API...");

    try {
      const resp = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          platform: publishPlatform,
          content: contentText,
          projectName
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.ok === false) {
        throw new Error(data.error || "Official API posting failed.");
      }

      setPublishStatusMsg(`Successfully published! Post ID: ${data.postId || "N/A"}. Message: ${data.message || ""}`);
    } catch (err) {
      setPublishStatusMsg(`Error publishing to API: ${err.message}`);
    } finally {
      setIsPublishingToApi(false);
    }
  }

  useEffect(() => {
    setAccessToken(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "");
    checkHealth();
    fetchProviderStatus();
  }, []);

  const visibleChannels = useMemo(() => {
    const available = Object.keys(result?.posts || {});
    return CHANNELS.filter(([key]) => available.includes(key));
  }, [result]);

  const sourceCount = useMemo(
    () =>
      [brief.trim(), links.trim(), repoUrl.trim(), docsUrl.trim(), appUrl.trim(), documentText.trim(), fileNames.length, mediaItems.length].filter(Boolean).length,
    [brief, fileNames.length, links, mediaItems.length, repoUrl, docsUrl, appUrl, documentText],
  );

  async function checkHealth() {
    try {
      const resp = await fetch(`${API_BASE}/health`);
      const data = await resp.json();
      setAccessLocked(Boolean(data?.access_locked));
    } catch {
      setAccessLocked(false);
    }
  }

  async function fetchProviderStatus() {
    try {
      const resp = await fetch(`${API_BASE}/provider_status`);
      if (resp.ok) {
        const data = await resp.json();
        setProviderConfigs(data);
      }
    } catch (e) {
      console.error("Failed to query provider configurations", e);
    }
  }

  function authHeaders() {
    const headers = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  async function unlockWorkspace(event) {
    event.preventDefault();
    setAccessMessage("");
    setError("");

    try {
      const resp = await fetch(`${API_BASE}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_key: accessKey }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || "Access key was not accepted.");
      }

      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.token);
      setAccessToken(data.token);
      setAccessKey("");
      setAccessMessage(`Unlocked successfully.`);
      fetchProviderStatus();
    } catch (unlockError) {
      setAccessMessage(unlockError.message);
    }
  }

  function toggleValue(value, setter) {
    setter((current) => {
      if (current.includes(value)) {
        return current.length === 1 ? current : current.filter((item) => item !== value);
      }
      return [...current, value];
    });
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const ext = file.name.split(".").pop().toLowerCase();
      let category = "doc";
      if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
        category = file.name.toLowerCase().includes("logo") ? "logo" : "screenshot";
      } else if (["mp4", "mov", "webm", "avi"].includes(ext)) {
        category = "screen recording";
      }

      const url = URL.createObjectURL(file);
      const newFileObj = {
        id: `upload-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category: category,
        description: "",
        url: url
      };

      if (category === "doc" && ["txt", "md", "json", "js", "ts", "html", "css"].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newFileObj.content = e.target.result;
          setUploadedFiles(current => [...current, newFileObj]);
        };
        reader.readAsText(file);
      } else {
        setUploadedFiles(current => [...current, newFileObj]);
      }
    });
  }

  async function startScreenCapture() {
    setError("");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen capture is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
      streamRef.current = stream;
      chunksRef.current = [];
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        if (!chunksRef.current.length) {
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const name = `recording-${new Date().getTime()}.webm`;
        const url = URL.createObjectURL(blob);
        const newFileObj = {
          id: `record-${new Date().getTime()}`,
          name: name,
          size: blob.size,
          type: blob.type,
          category: "screen recording",
          description: "Captured screen demo",
          url: url
        };
        setUploadedFiles(current => [newFileObj, ...current]);
        setCaptureStatus("Recording saved");
      };
      stream.getVideoTracks()[0]?.addEventListener("ended", () => stopScreenCapture());
      recorder.start();
      setCaptureStatus("Recording screen");
    } catch (captureError) {
      setCaptureStatus("Ready");
      setError(captureError.message || "Screen capture was cancelled.");
    }
  }

  function stopScreenCapture() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setCaptureStatus("Saved");
  }

  function captureScreenshot() {
    const video = videoPreviewRef.current;
    if (!video?.srcObject || !video.videoWidth || !video.videoHeight) {
      setError("Start screen recording capture to grab a screenshot state.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not capture frame image.");
        return;
      }
      const name = `screenshot-${new Date().getTime()}.png`;
      const url = URL.createObjectURL(blob);
      const newFileObj = {
        id: `screenshot-${new Date().getTime()}`,
        name: name,
        size: blob.size,
        type: blob.type,
        category: "screenshot",
        description: "Captured screen frame screenshot",
        url: url
      };
      setUploadedFiles(current => [newFileObj, ...current]);
      setCaptureStatus("Screenshot saved");
    }, "image/png");
  }

  // Frontend Input Validations
  function validateInputs() {
    setError("");
    const desc = brief.trim();
    const repo = repoUrl.trim();
    const textDoc = documentText.trim();
    const hasUploads = uploadedFiles.length > 0;

    if (!desc && !repo && !textDoc && !hasUploads) {
      setError("Please provide at least one source context: a description brief, a GitHub repo URL, pasted document text, or uploaded reference files.");
      return false;
    }

    if (repo) {
      let check = repo;
      if (!check.startsWith("http://") && !check.startsWith("https://")) {
        check = "https://" + check;
      }
      try {
        const url = new URL(check);
        if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
          setError("GitHub URL must point to github.com.");
          return false;
        }
      } catch {
        setError("GitHub URL format is invalid.");
        return false;
      }
    }

    return true;
  }

  async function generatePackage(event) {
    event.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    if (accessLocked && !accessToken) {
      setError("This hosted demo is locked. Unlock before generating.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setLoadingStatus("Reading repo...");

    const checkInterval = setInterval(() => {
      setLoadingStatus((current) => {
        if (current === "Reading repo...") return "Scraping links...";
        if (current === "Scraping links...") return "Capturing live app...";
        if (current === "Capturing live app...") return "Assembling context brief...";
        if (current === "Assembling context brief...") return "Calling model provider...";
        if (current === "Calling model provider...") return "Compiling package outputs...";
        return "Finalizing package...";
      });
    }, 1800);

    try {
      // Compile media items and document text from files
      const reqMedia = uploadedFiles.filter(f => f.category !== "doc").map(f => ({
        type: f.category,
        name: f.name,
        description: f.description || ""
      }));
      const docsTextParts = uploadedFiles.filter(f => f.category === "doc" && f.content).map(f => `--- Document: ${f.name} ---\n${f.content}`);
      const combinedDocText = [documentText, ...docsTextParts].filter(Boolean).join("\n\n");

      const resp = await fetch(`${API_BASE}/launch_kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          project_name: projectName,
          notes: brief,
          research_url: links,
          repo: repoUrl,
          docs_url: docsUrl,
          app_url: appUrl,
          enable_auto_capture: enableAutoCapture,
          document_text: combinedDocText,
          media_items: reqMedia,
          channels: selectedChannels,
          output_types: selectedOutputs,
          audience,
          generator: modelRoute,
          model_endpoint: modelEndpoint,
          model_name: modelName,
        }),
      });
      
      const data = await resp.json();
      clearInterval(checkInterval);

      if (!resp.ok) {
        if (resp.status === 401) {
          window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          setAccessToken("");
        }
        throw new Error(data?.error || `${PRODUCT_NAME} could not generate content.`);
      }

      setResult(data);
      setActiveChannel(Object.keys(data?.posts || {})[0] || "linkedin");
      setHasGenerated(true);
      setStep(3);
    } catch (generateError) {
      clearInterval(checkInterval);
      setError(generateError.message);
    } finally {
      setIsGenerating(false);
    }
  }

  // Interactive Edit textareas update handlers
  function handleDescriptionEdit(val) {
    setResult((prev) => {
      const updated = { ...prev };
      if (!updated.package) updated.package = {};
      if (!updated.package.project) updated.package.project = {};
      updated.package.project.description = val;
      return updated;
    });
  }

  function handleAudienceEdit(val) {
    setResult((prev) => {
      const updated = { ...prev };
      if (!updated.package) updated.package = {};
      if (!updated.package.project) updated.package.project = {};
      updated.package.project.audience = val;
      return updated;
    });
  }

  function handleAngleEdit(val) {
    setResult((prev) => {
      const updated = { ...prev };
      if (!updated.package) updated.package = {};
      if (!updated.package.strategy) updated.package.strategy = {};
      updated.package.strategy.coreAngle = val;
      return updated;
    });
  }

  function handlePositioningEdit(val) {
    setResult((prev) => {
      const updated = { ...prev };
      if (!updated.package) updated.package = {};
      if (!updated.package.strategy) updated.package.strategy = {};
      updated.package.strategy.positioning = val;
      return updated;
    });
  }

  function handlePostEdit(channel, val) {
    setResult((prev) => {
      const updated = { ...prev };
      
      // Update preview post
      if (!updated.posts) updated.posts = {};
      updated.posts[channel] = val;

      // Update structural post mapping in the package for exports
      if (updated.package && updated.package.posts) {
        const target = updated.package.posts;
        if (channel === "linkedin") {
          if (typeof target.linkedin === "string") target.linkedin = val;
          else if (target.linkedin) target.linkedin.body = val;
        } else if (channel === "x") {
          if (target.x) target.x.posts = val.split("\n\n");
        } else if (channel === "instagram") {
          if (target.instagram) target.instagram.caption = val;
        } else if (channel === "reddit") {
          if (target.reddit) target.reddit.body = val;
        } else if (channel === "hn") {
          if (target.hackernews) target.hackernews.body = val;
        } else if (channel === "blog") {
          if (target.blog) target.blog.draft = val;
        } else if (channel === "newsletter") {
          if (target.newsletter) target.newsletter.body = val;
        } else if (channel === "release_notes") {
          if (target.releaseNotes) target.releaseNotes.sections = [{ title: "Release Changelog", items: [val] }];
        }
      }
      return updated;
    });
  }

  // Trigger POST-based server side exports
  async function triggerExport(endpoint, fileExtension) {
    setError("");
    const filename = `${projectName.toLowerCase().replace(/\s+/g, "-")}-package.${fileExtension}`;
    
    const payload = {
      package: result.package || result.json,
      projectName,
      prompt: result.chatbot_prompt || "",
      metadata: {
        providerUsed: result.providerUsed,
        fallbackUsed: result.fallbackUsed,
        selectedChannels,
        selectedOutputs
      }
    };

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Export route failed (HTTP ${resp.status})`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  }

  async function copyText(label, text) {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel(""), 1500);
    } catch {
      setError("Clipboard access blocked. Copy the text manually from the card.");
    }
  }

  const imageSrc = result?.image_base64
    ? `data:${result.image_mime || "image/svg+xml"};base64,${result.image_base64}`
    : "";
  const currentPost = result?.posts?.[activeChannel] || "";

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.brandMark}>SF</div>
        <p className={styles.eyebrow}>{PRODUCT_NAME} V1</p>
        <h1>Code in. Structured launch packages out.</h1>
        <p>
          Analyze GitHub code, documents, URLs, and screenshots to generate matching LinkedIn posts, X threads, release updates, and media plans in one run.
        </p>
      </header>

      {accessLocked && (
        <section className={styles.accessPanel}>
          <div>
            <p className={styles.eyebrow}>Workspace status</p>
            <h2>{accessToken ? "Workspace session unlocked" : "Self-hosted lock active"}</h2>
          </div>
          {accessToken ? (
            <button
              className={styles.secondaryButton}
              onClick={() => {
                window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                setAccessToken("");
                fetchProviderStatus();
              }}
              type="button"
            >
              Lock workspace
            </button>
          ) : (
            <form className={styles.accessForm} onSubmit={unlockWorkspace}>
              <input
                aria-label="Access Key"
                onChange={(event) => setAccessKey(event.target.value)}
                placeholder="Access key password"
                type="password"
                value={accessKey}
              />
              <button className={styles.primaryButton} type="submit">
                Unlock
              </button>
            </form>
          )}
          {accessMessage && <p className={styles.accessMessage}>{accessMessage}</p>}
        </section>
      )}

      {error && (
        <div className={styles.accessPanel} style={{ borderColor: "#a93426", background: "rgba(169, 52, 38, 0.05)", display: "block" }}>
          <p style={{ color: "#a93426", fontWeight: "bold", margin: 0 }}>⚠️ Processing Error</p>
          <p style={{ color: "#121612", margin: "5px 0 0" }}>{error}</p>
        </div>
      )}

      {result?.warnings?.length > 0 && (
        <div className={styles.accessPanel} style={{ borderColor: "#ea6b4d", background: "rgba(234, 107, 77, 0.05)", display: "block", marginBottom: 28 }}>
          <p style={{ color: "#ea6b4d", fontWeight: "bold", margin: 0 }}>ℹ️ Generation Warnings</p>
          <ul style={{ margin: "5px 0 0", paddingLeft: 20, color: "#414941" }}>
            {result.warnings.map((w, index) => (
              <li key={index}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section className={styles.shell}>
        <aside className={styles.stepRail} aria-label="Workflow steps">
          {STEPS.map((label, index) => (
            <button
              className={index === step ? styles.currentStep : index < step ? styles.doneStep : ""}
              key={label}
              onClick={() => setStep(index)}
              type="button"
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </aside>

        <form className={styles.stage} onSubmit={generatePackage}>
          {step === 0 && (
            <section className={styles.panel}>
              <div className={styles.panelIntro}>
                <p className={styles.eyebrow}>Step 1</p>
                <h2>Choose a model route.</h2>
                <p>Pick a free copy-paste prompt generator, deterministic templates, cloud APIs, or a private local SLM endpoint.</p>
              </div>

              <div className={styles.modelGrid}>
                {MODEL_ROUTES_META.map((provider) => {
                  const status = providerConfigs[provider.key] || {};
                  const isConfig = provider.key === "prompt" || provider.key === "template" || status.configured;
                  
                  return (
                    <button
                      className={modelRoute === provider.key ? styles.selectedCard : ""}
                      key={provider.key}
                      onClick={() => setModelRoute(provider.key)}
                      type="button"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ fontSize: "1.1rem" }}>{provider.title}</span>
                        <div style={{ display: "flex", gap: 5 }}>
                          <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: 4, background: provider.badge === "Local" ? "#24715d" : "#ea6b4d", color: "#fff" }}>
                            {provider.badge}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: "4px 0" }}>{provider.desc}</p>
                      <span style={{ fontSize: "0.8rem", color: isConfig ? "#24715d" : "#a93426", fontWeight: "bold" }}>
                        {isConfig ? "✓ Configured" : "⚠ Not configured (will use template fallback)"}
                      </span>
                      <p style={{ fontSize: "0.75rem", color: "#667069", marginTop: 4 }}>
                        Best: {provider.use} ({provider.price})
                      </p>
                    </button>
                  );
                })}
              </div>

              {modelRoute !== "prompt" && modelRoute !== "template" && (
                <div className={styles.softBox}>
                  <label className={styles.field}>
                    Model endpoint base URL (Optional override)
                    <input
                      onChange={(event) => setModelEndpoint(event.target.value)}
                      placeholder={
                        modelRoute === "ollama" ? "http://localhost:11434/v1" :
                        modelRoute === "lmstudio" ? "http://localhost:1234/v1" :
                        "https://api.example.com/v1"
                      }
                      value={modelEndpoint}
                    />
                  </label>
                  <label className={styles.field}>
                    Model name identifier (Optional override)
                    <input
                      onChange={(event) => setModelName(event.target.value)}
                      placeholder="llama3, gpt-4o-mini, etc."
                      value={modelName}
                    />
                  </label>
                </div>
              )}

              <div className={styles.actions}>
                <button className={styles.primaryButton} onClick={() => setStep(1)} type="button">
                  Continue to inputs
                </button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className={styles.panel}>
              <div className={styles.panelIntro}>
                <p className={styles.eyebrow}>Step 2</p>
                <h2>Give the raw material.</h2>
                <p>Provide descriptions, repositories, public URLs, or screenshots. Minimum required: a description, repo, or document text.</p>
              </div>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  Product/App name
                  <input
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="e.g. SignalFlow Studio"
                    type="text"
                    value={projectName}
                  />
                </label>
                <label className={styles.field}>
                  Target Audience
                  <input
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder="e.g. developers, SaaS users, indie builders"
                    type="text"
                    value={audience}
                  />
                </label>
              </div>

              <label className={styles.heroInput} style={{ marginTop: 20 }}>
                Main brief description
                <textarea
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder="What is this? What does it do? Any specific features, update highlights, or notes?"
                  rows={6}
                  value={brief}
                />
              </label>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  GitHub public repository URL
                  <input
                    onChange={(event) => setRepoUrl(event.target.value)}
                    placeholder="https://github.com/username/repository"
                    type="text"
                    value={repoUrl}
                  />
                </label>
                <label className={styles.field}>
                  Documentation URL
                  <input
                    onChange={(event) => setDocsUrl(event.target.value)}
                    placeholder="https://docs.example.com"
                    type="text"
                    value={docsUrl}
                  />
                </label>
              </div>

              <div className={styles.twoCols}>
                <div style={{ display: "grid", gap: 10 }}>
                  <label className={styles.field}>
                    Live App URL (Used for context)
                    <input
                      onChange={(event) => setAppUrl(event.target.value)}
                      placeholder="e.g. http://localhost:3000 or https://example.com"
                      type="text"
                      value={appUrl}
                    />
                  </label>
                  <label className={styles.checkRow} style={{ marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={enableAutoCapture}
                      onChange={(e) => setEnableAutoCapture(e.target.checked)}
                      style={{ width: "auto", cursor: "pointer" }}
                    />
                    Enable automated screenshots (Experimental, requires server Playwright)
                  </label>
                </div>
                <label className={styles.field}>
                  Research links / Additional URLs (Space-separated)
                  <textarea
                    onChange={(event) => setLinks(event.target.value)}
                    placeholder="https://link1.com https://link2.com"
                    rows={1}
                    value={links}
                  />
                </label>
              </div>

              <label className={styles.field} style={{ marginTop: 20 }}>
                Pasted document content
                <textarea
                  onChange={(event) => setDocumentText(event.target.value)}
                  placeholder="Paste changelogs, full logs, text files, or raw copy briefs here."
                  rows={4}
                  value={documentText}
                />
              </label>

              <div className={styles.mediaGrid}>
                <label className={styles.uploadTile}>
                  <input multiple onChange={handleFiles} type="file" />
                  <strong>Upload Local Assets</strong>
                  <span>Select screenshots, screen recordings, logos, product images, or docs</span>
                </label>
                <div className={styles.captureTile}>
                  <strong>Record Screen Demonstration</strong>
                  <span>Status: {captureStatus}</span>
                  <div className={styles.miniActions}>
                    <button className={styles.secondaryButton} onClick={startScreenCapture} type="button">
                      Start Screen Share
                    </button>
                    <button className={styles.secondaryButton} onClick={captureScreenshot} type="button">
                      Screenshot Frame
                    </button>
                    <button className={styles.secondaryButton} onClick={stopScreenCapture} type="button">
                      Stop & Save Recording
                    </button>
                  </div>
                  <video className={styles.preview} muted playsInline ref={videoPreviewRef} />
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "#101410" }}>Uploaded & Captured Assets ({uploadedFiles.length})</h3>
                  <div style={{ display: "grid", gap: 14 }}>
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        style={{ 
                          background: "#fffaf0", 
                          border: "1px solid rgba(18,22,18,0.1)", 
                          padding: 16, 
                          borderRadius: 8, 
                          display: "grid", 
                          gridTemplateColumns: "1fr auto", 
                          gap: 16 
                        }}
                      >
                        <div style={{ display: "grid", gap: 10 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <strong style={{ fontSize: "0.95rem" }}>{file.name}</strong>
                            <span style={{ fontSize: "0.8rem", color: "#667069" }}>({(file.size / 1024).toFixed(1)} KB)</span>
                            <select
                              value={file.category}
                              onChange={(e) => {
                                const cat = e.target.value;
                                setUploadedFiles(current => current.map(f => f.id === file.id ? { ...f, category: cat } : f));
                              }}
                              style={{ 
                                padding: "4px 8px", 
                                borderRadius: 6, 
                                border: "1px solid rgba(18,22,18,0.15)", 
                                background: "#fff", 
                                fontSize: "0.85rem", 
                                fontWeight: "bold" 
                              }}
                            >
                              <option value="screenshot">Screenshot</option>
                              <option value="screen recording">Screen Recording</option>
                              <option value="logo">Logo</option>
                              <option value="product image">Product Image</option>
                              <option value="doc">Document</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Add brief description/context for this asset (e.g. 'Main application login screen')"
                            value={file.description || ""}
                            onChange={(e) => {
                              const desc = e.target.value;
                              setUploadedFiles(current => current.map(f => f.id === file.id ? { ...f, description: desc } : f));
                            }}
                            style={{ 
                              width: "100%", 
                              padding: 8, 
                              borderRadius: 6, 
                              border: "1px solid rgba(18,22,18,0.1)", 
                              background: "#fff", 
                              fontSize: "0.85rem" 
                            }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setUploadedFiles(current => current.filter(f => f.id !== file.id))}
                          style={{ 
                            border: "1px solid rgba(169, 52, 38, 0.2)", 
                            background: "rgba(169, 52, 38, 0.05)", 
                            color: "#a93426", 
                            padding: "8px 12px", 
                            borderRadius: 6, 
                            cursor: "pointer", 
                            fontWeight: "bold",
                            alignSelf: "center"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <button className={styles.secondaryButton} onClick={() => setStep(0)} type="button">
                  Back
                </button>
                <button className={styles.primaryButton} onClick={() => setStep(2)} type="button">
                  Continue to outputs
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className={styles.panel}>
              <div className={styles.panelIntro}>
                <p className={styles.eyebrow}>Step 3</p>
                <h2>Choose what to generate.</h2>
                <p>Configure which platforms and asset outputs you want included in your Studio Package.</p>
              </div>

              <div className={styles.pickGroup}>
                <h3>Outputs Format Selection</h3>
                <div className={styles.pillGrid}>
                  {OUTPUT_TYPES.map(([key, label]) => (
                    <button
                      className={selectedOutputs.includes(key) ? styles.selectedPill : ""}
                      key={key}
                      onClick={() => toggleValue(key, setSelectedOutputs)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.pickGroup}>
                <h3>Platform Channels Selection</h3>
                <div className={styles.pillGrid}>
                  {CHANNELS.map(([key, label]) => (
                    <button
                      className={selectedChannels.includes(key) ? styles.selectedPill : ""}
                      key={key}
                      onClick={() => toggleValue(key, setSelectedChannels)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.summaryStrip}>
                <span>{sourceCount || 0} inputs parsed</span>
                <span>{selectedOutputs.length} formats</span>
                <span>{selectedChannels.length} platforms</span>
              </div>

              <div className={styles.actions}>
                <button className={styles.secondaryButton} onClick={() => setStep(1)} type="button">
                  Back
                </button>
                <button className={styles.primaryButton} disabled={isGenerating || (accessLocked && !accessToken)}>
                  {isGenerating ? `Generating: ${loadingStatus}` : "Generate Package"}
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className={styles.panel}>
              <div className={styles.panelIntro}>
                <p className={styles.eyebrow}>Step 4</p>
                <h2>{hasGenerated ? "Review and customize." : "Preview Package"}</h2>
                <p>Modify generated drafts dynamically. The edits affect the downloaded ZIP, Markdown, and JSON files.</p>
              </div>

              {!hasGenerated ? (
                <div style={{ textAlign: "center", padding: "60px 0", border: "2px dashed rgba(18,22,18,0.1)", borderRadius: 12 }}>
                  <p>No package generated yet. Configure inputs and click generate to begin.</p>
                  <button className={styles.primaryButton} onClick={() => setStep(1)} type="button" style={{ marginTop: 15 }}>
                    Configure Inputs
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.resultStats}>
                    <div>
                      <strong>{visibleChannels.length}</strong>
                      <span>channels</span>
                    </div>
                    <div>
                      <strong>{result?.outputs?.length || selectedOutputs.length}</strong>
                      <span>formats</span>
                    </div>
                    <div>
                      <strong>{result?.media_plan?.length || 0}</strong>
                      <span>assets scheduled</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 30, background: "#fffaf0", padding: 22, borderRadius: 8, border: "1px solid rgba(18,22,18,0.1)" }}>
                    <h3 style={{ margin: "0 0 15px", fontSize: "1.1rem" }}>Product Positioning & Strategy Brief</h3>
                    
                    <div className={styles.twoCols}>
                      <label className={styles.field}>
                        Product Description
                        <textarea
                          onChange={(e) => handleDescriptionEdit(e.target.value)}
                          rows={3}
                          value={result?.package?.project?.description || ""}
                        />
                      </label>
                      <label className={styles.field}>
                        Target Audience
                        <textarea
                          onChange={(e) => handleAudienceEdit(e.target.value)}
                          rows={3}
                          value={result?.package?.project?.audience || ""}
                        />
                      </label>
                    </div>

                    <div className={styles.twoCols} style={{ marginTop: 15 }}>
                      <label className={styles.field}>
                        Core Posting Angle
                        <textarea
                          onChange={(e) => handleAngleEdit(e.target.value)}
                          rows={3}
                          value={result?.package?.strategy?.coreAngle || ""}
                        />
                      </label>
                      <label className={styles.field}>
                        Market Positioning Statement
                        <textarea
                          onChange={(e) => handlePositioningEdit(e.target.value)}
                          rows={3}
                          value={result?.package?.strategy?.positioning || ""}
                        />
                      </label>
                    </div>

                    {result?.package?.context?.confirmedFacts?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <strong>Confirmed Facts from Context:</strong>
                        <ul style={{ margin: "5px 0 0", paddingLeft: 20, color: "#59635c" }}>
                          {result.package.context.confirmedFacts.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    {result?.package?.context?.inferredFacts?.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <strong>Inferred Assumptions:</strong>
                        <ul style={{ margin: "5px 0 0", paddingLeft: 20, color: "#59635c" }}>
                          {result.package.context.inferredFacts.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className={styles.tabs}>
                    {visibleChannels.map(([key, label]) => (
                      <button
                        className={activeChannel === key ? styles.activeTab : ""}
                        key={key}
                        onClick={() => setActiveChannel(key)}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className={styles.resultGrid}>
                    <article className={styles.outputCard}>
                      <div className={styles.cardTitle}>
                        <h3>{CHANNELS.find(([key]) => key === activeChannel)?.[1] || "Channel"} Copy Editor</h3>
                        <div style={{ display: "flex", gap: 10 }}>
                          <button className={styles.secondaryButton} onClick={() => copyText("post", currentPost)} type="button" style={{ minHeight: 34, padding: "4px 12px" }}>
                            {copiedLabel === "post" ? "Copied" : "Copy text"}
                          </button>
                        </div>
                      </div>
                      
                      <textarea
                        onChange={(e) => handlePostEdit(activeChannel, e.target.value)}
                        style={{ width: "100%", height: 320, background: "#171b18", color: "#f4f7f2", fontFamily: "monospace", padding: 15, borderRadius: 8, border: "1px solid #1d241f" }}
                        value={currentPost}
                      />
                      
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#59635c", marginTop: 5 }}>
                        <span>Character Count: {currentPost.length}</span>
                        <span>Platform: {activeChannel}</span>
                      </div>
                    </article>

                    <article className={styles.outputCard}>
                      <div className={styles.cardTitle}>
                        <h3>Visual SVG Card Asset</h3>
                        <span>{result?.assets?.code_image || "post-card.svg"}</span>
                      </div>
                      {imageSrc ? (
                        <img className={styles.visualAsset} src={imageSrc} alt="Generated visual card mockup" />
                      ) : (
                        <div className={styles.emptyAsset}>No visual asset preview available.</div>
                      )}
                    </article>
                  </div>

                  <h3 style={{ marginTop: 40, marginBottom: 15 }}>Media & Verification Actions</h3>
                  
                  <div className={styles.assetGrid} style={{ marginTop: 0 }}>
                    <article>
                      <span>Media Checklist</span>
                      <strong>Visual requirements</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.assetChecklist?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No requirements compiled</li>}
                      </ul>
                    </article>
                    
                    <article>
                      <span>Reel Script</span>
                      <strong>Video Script Plan</strong>
                      <ol style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.85rem" }}>
                        {result?.package?.media?.videoScript?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No script compiled</li>}
                      </ol>
                    </article>

                    <article>
                      <span>Shot List</span>
                      <strong>Video Shot Plan</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.shotList?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No shot list compiled</li>}
                      </ul>
                    </article>

                    <article>
                      <span>Screenshot Plan</span>
                      <strong>Visual Capture Tasks</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.screenshotPlan?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No screenshot plan compiled</li>}
                      </ul>
                    </article>

                    <article>
                      <span>Carousel Plan</span>
                      <strong>Slide Deck Layout</strong>
                      <ol style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.85rem" }}>
                        {result?.package?.media?.carouselPlan?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No carousel plan compiled</li>}
                      </ol>
                    </article>

                    <article>
                      <span>Editing Timeline</span>
                      <strong>Video Editing Steps</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.videoEditingTimeline?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No timeline compiled</li>}
                      </ul>
                    </article>

                    <article style={{ gridColumn: "span 2" }}>
                      <span>Thumbnail Generation</span>
                      <strong>Thumbnail Prompt</strong>
                      <p style={{ color: "#59635c", fontSize: "0.9rem", margin: 0, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                        {result?.package?.media?.thumbnailPrompt || "No thumbnail prompt compiled"}
                      </p>
                    </article>

                    <article>
                      <span>Publishing Checklist</span>
                      <strong>Handoff checklist</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.publishing?.platformChecklist?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No checklist compiled</li>}
                      </ul>
                    </article>
                  </div>

                  <div className={styles.softBox} style={{ background: "#ede7db", marginTop: 30 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ display: "block" }}>Export Handoff Package</strong>
                        <span style={{ fontSize: "0.9rem", color: "#59635c" }}>Download review-ready package documents. Excludes passwords or credentials.</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button className={styles.secondaryButton} onClick={() => triggerExport("/api/export/markdown", "md")} type="button">
                          Download Markdown
                        </button>
                        <button className={styles.secondaryButton} onClick={() => triggerExport("/api/export/json", "json")} type="button">
                          Download JSON
                        </button>
                        <button className={styles.primaryButton} onClick={() => triggerExport("/api/export/zip", "zip")} type="button">
                          Download ZIP
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 style={{ marginTop: 40, marginBottom: 15 }}>Post & Publish Content</h3>
                  
                  <div style={{ background: "#fffaf0", border: "1px solid rgba(18,22,18,0.1)", padding: 22, borderRadius: 8, boxDizing: "border-box", display: "grid", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15 }}>
                      <div>
                        <strong>Select publishing channel:</strong>
                        <select 
                          value={publishPlatform} 
                          onChange={(e) => {
                            setPublishPlatform(e.target.value);
                            setPublishStatusMsg("");
                          }}
                          style={{ marginLeft: 10, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(18,22,18,0.15)", background: "#fff" }}
                        >
                          {visibleChannels.map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.85rem", padding: "4px 8px", borderRadius: 4, background: isPublishConfigured ? "#24715d" : "#ede7db", color: isPublishConfigured ? "#fff" : "#667069", fontWeight: "bold" }}>
                          {isPublishConfigured ? "✓ API Integration Configured" : "⚠ Manual Handoff Only"}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: "#171b18", padding: 15, borderRadius: 8, color: "#f4f7f2", fontSize: "0.9rem" }}>
                      <strong style={{ display: "block", color: "#38bdf8", marginBottom: 8 }}>Final Publication Content:</strong>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{result?.posts?.[publishPlatform] || "No content compiled."}</pre>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button 
                        className={styles.secondaryButton} 
                        onClick={() => copyText("publish", result?.posts?.[publishPlatform])}
                        type="button"
                      >
                        {copiedLabel === "publish" ? "Copied!" : "1. Copy to Clipboard"}
                      </button>
                      
                      <button 
                        className={styles.secondaryButton} 
                        onClick={() => triggerExport("/api/export/markdown", "md")}
                        type="button"
                      >
                        2. Download Posting Brief
                      </button>

                      <button 
                        className={styles.primaryButton}
                        onClick={handlePublishAction}
                        disabled={isPublishingToApi}
                        type="button"
                        style={{ background: isPublishConfigured ? "#24715d" : "#ede7db", color: isPublishConfigured ? "#fff" : "#121612", fontWeight: "bold" }}
                      >
                        {isPublishingToApi ? "Publishing via API..." : "Publish via API"}
                      </button>
                    </div>

                    {publishStatusMsg && (
                      <div style={{ padding: 15, borderRadius: 8, background: publishStatusMsg.includes("Error") || publishStatusMsg.includes("not configured") ? "rgba(169, 52, 38, 0.08)" : "rgba(36, 113, 93, 0.08)", border: "1px solid", borderColor: publishStatusMsg.includes("Error") || publishStatusMsg.includes("not configured") ? "#a93426" : "#24715d" }}>
                        <strong>Publishing Status:</strong>
                        <p style={{ margin: "5px 0 0", color: "#121612" }}>{publishStatusMsg}</p>
                      </div>
                    )}

                    <div style={{ background: "#fff", border: "1px solid rgba(18,22,18,0.1)", padding: 15, borderRadius: 8 }}>
                      <strong style={{ display: "block", marginBottom: 8 }}>Platform Posting Checklist:</strong>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "#59635c", fontSize: "0.9rem" }}>
                        <li>Review the final drafted copy in the block above for syntax, tags, and structure.</li>
                        <li>Confirm that the Alt description tags for screens match details in the media brief.</li>
                        <li>Attach the SVG visual asset card or local WebM recordings during composition.</li>
                        <li>Ensure no passwords or secrets are contained in any posts.</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              <div className={styles.actions}>
                <button className={styles.secondaryButton} onClick={() => setStep(2)} type="button">
                  Edit Outputs Config
                </button>
              </div>
            </section>
          )}
        </form>
      </section>
    </main>
  );
}
