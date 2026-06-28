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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [preparedPackage, setPreparedPackage] = useState(null);
  const [isLoadingPrepare, setIsLoadingPrepare] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [useTempKeyForGen, setUseTempKeyForGen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [setupInstructionProvider, setSetupInstructionProvider] = useState(null);
  
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("svg"); // "svg" or "preview"
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [githubToken, setGithubToken] = useState("");

  const [publishPlatform, setPublishPlatform] = useState("linkedin");
  const [isPublishingToApi, setIsPublishingToApi] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState("");

  // Social media account connection state
  const [socialAccounts, setSocialAccounts] = useState({});
  const [oauthMessage, setOauthMessage] = useState(null);
  const [socialSetupExpanded, setSocialSetupExpanded] = useState(null);
  const [redditSubreddit, setRedditSubreddit] = useState("");
  const [redditTitle, setRedditTitle] = useState("");

  const isSocialConnected = useMemo(() => {
    const account = socialAccounts[publishPlatform];
    return Boolean(account?.connected && !account?.expired);
  }, [socialAccounts, publishPlatform]);

  async function fetchSocialStatus() {
    try {
      const resp = await fetch(`${API_BASE}/social/status`, {
        headers: authHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setSocialAccounts(data.platforms || {});
      }
    } catch (e) {
      console.error("Failed to fetch social status", e);
    }
  }

  function handleSocialConnect(platformId) {
    // Open OAuth flow in same window — will redirect back after auth
    const url = `${API_BASE}/social/connect?platform=${platformId}`;
    window.location.href = url;
  }

  async function handleSocialDisconnect(platformId) {
    try {
      const resp = await fetch(`${API_BASE}/social/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ platform: platformId })
      });
      if (resp.ok) {
        setSocialAccounts(prev => {
          const updated = { ...prev };
          if (updated[platformId]) {
            updated[platformId] = { ...updated[platformId], connected: false, profile: null };
          }
          return updated;
        });
      }
    } catch (e) {
      console.error("Failed to disconnect", e);
    }
  }

  async function handlePublishAction() {
    setPublishStatusMsg("");
    const contentText = result?.posts?.[publishPlatform] || "";
    if (!contentText) {
      setPublishStatusMsg("Error: No draft content compiled for this platform.");
      return;
    }

    if (!isSocialConnected) {
      setPublishStatusMsg(`Your ${publishPlatform} account is not connected. Connect it from the Connected Accounts panel above, or use Copy & Paste.`);
      return;
    }

    const platformLabel = (socialAccounts[publishPlatform]?.label || publishPlatform).toUpperCase();
    const confirmed = window.confirm(`Publish to ${platformLabel}?\n\nContent preview:\n${contentText.substring(0, 200)}...`);
    if (!confirmed) return;

    setIsPublishingToApi(true);
    setPublishStatusMsg("Publishing...");

    try {
      const resp = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          platform: publishPlatform,
          content: contentText,
          projectName,
          options: {
            subreddit: redditSubreddit || "test",
            title: redditTitle || projectName,
            projectName
          }
        })
      });

      const data = await resp.json();
      if (!resp.ok || data.ok === false) {
        throw new Error(data.error || "Publishing failed.");
      }

      setPublishStatusMsg(JSON.stringify({
        type: "success",
        message: data.message || "Published!",
        postUrl: data.postUrl || "",
        postId: data.postId || ""
      }));
    } catch (err) {
      setPublishStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsPublishingToApi(false);
    }
  }

  useEffect(() => {
    setAccessToken(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "");
    checkHealth();
    fetchProviderStatus();
    fetchSocialStatus();

    // Handle OAuth callback params in URL
    const params = new URLSearchParams(window.location.search);
    const socialStatus = params.get("social_status");
    const socialMessage = params.get("social_message");
    if (socialStatus && socialMessage) {
      setOauthMessage({ type: socialStatus, message: socialMessage });
      setStep(3); // Go to Package step to see the connected accounts panel
      // Clean URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
      // Refresh social status
      setTimeout(() => fetchSocialStatus(), 500);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setOauthMessage(null), 8000);
    }
  }, []);

  async function fetchPreparedPackage(platform, content, pkg) {
    if (!platform || !content) return;
    setIsLoadingPrepare(true);
    try {
      const resp = await fetch("/api/post/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          platform,
          content,
          package: pkg
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setPreparedPackage(data);
      }
    } catch (e) {
      console.error("Failed to prepare posting package", e);
    } finally {
      setIsLoadingPrepare(false);
    }
  }

  useEffect(() => {
    if (hasGenerated && result?.posts?.[publishPlatform]) {
      fetchPreparedPackage(publishPlatform, result.posts[publishPlatform], result.package || result.json);
    }
  }, [publishPlatform, result, hasGenerated]);

  useEffect(() => {
    const handlePaste = (event) => {
      if (step !== 1) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.indexOf("image") !== -1 || item.type.indexOf("video") !== -1) {
          const file = item.getAsFile();
          if (file) {
            const isVideo = file.type.startsWith("video/");
            const typeLabel = isVideo ? "recording" : "screenshot";
            const name = `pasted-${typeLabel}-${new Date().getTime()}.${isVideo ? "mp4" : "png"}`;
            const url = URL.createObjectURL(file);
            const newFileObj = {
              id: `paste-${new Date().getTime()}`,
              name: name,
              size: file.size,
              type: file.type,
              category: isVideo ? "screen recording" : "screenshot",
              description: `Pasted ${typeLabel} from clipboard`,
              url: url
            };
            setUploadedFiles(current => [newFileObj, ...current]);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [step]);

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
        const providers = data.providers || data;
        setProviderConfigs(providers);

        // Auto select default provider
        let defaultKey = data.defaultProvider || "";
        if (defaultKey && providers[defaultKey]) {
          setModelRoute(defaultKey);
        } else {
          // Fall back to prioritizations
          if (providers.gemini?.configured) {
            setModelRoute("gemini");
          } else if (providers.groq?.configured) {
            setModelRoute("groq");
          } else if (providers.openrouter?.configured) {
            setModelRoute("openrouter");
          } else {
            setModelRoute("template");
          }
        }
      }
    } catch (e) {
      console.error("Failed to query provider configurations", e);
    }
  }

  async function triggerTestConnection(providerKey) {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const resp = await fetch(`${API_BASE}/provider_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          provider: providerKey,
          modelName: modelName || providerConfigs[providerKey]?.defaultModel || "",
          baseUrl: modelEndpoint || "",
          temporaryApiKey: tempApiKey || ""
        })
      });
      
      const data = await resp.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({
        ok: false,
        error: e.message,
        setupHint: "Make sure you can access the server endpoint."
      });
    } finally {
      setIsTestingConnection(false);
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

  async function autoCaptureScreenshot() {
    if (!appUrl) {
      setError("Please specify a Live App URL first.");
      return;
    }
    setIsCapturingScreenshot(true);
    setError("");
    try {
      const resp = await fetch(`${API_BASE}/capture/app`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ appUrl })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to capture screenshot.");
      }
      if (!data.success) {
        throw new Error(data.warnings?.join(", ") || "Auto screenshot failed.");
      }
      
      const newFileObj = {
        id: `auto-${new Date().getTime()}`,
        name: data.name || `capture-${new Date().getTime()}.png`,
        size: 150 * 1024,
        type: "image/png",
        category: "screenshot",
        description: `Automated screenshot of ${appUrl}`,
        url: data.url
      };
      setUploadedFiles(current => [newFileObj, ...current]);
      setCaptureStatus("Server screenshot saved");
    } catch (err) {
      setError(`Auto screenshot failed: ${err.message}`);
    } finally {
      setIsCapturingScreenshot(false);
    }
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
    setLoadingStatus("Reading repository context...");

    const checkInterval = setInterval(() => {
      setLoadingStatus((current) => {
        if (current === "Reading repository context...") return "Reading docs and links...";
        if (current === "Reading docs and links...") return "Reading app URL context...";
        if (current === "Reading app URL context...") return "Preparing manual asset plan...";
        if (current === "Preparing manual asset plan...") return "Assembling product brief...";
        if (current === "Assembling product brief...") return "Calling selected model or fallback...";
        if (current === "Calling selected model or fallback...") return "Compiling exports...";
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
          github_token: isPrivateRepo ? githubToken : undefined,
          docs_url: docsUrl,
          app_url: appUrl,
          document_text: combinedDocText,
          media_items: reqMedia,
          channels: selectedChannels,
          output_types: selectedOutputs,
          audience,
          generator: modelRoute,
          model_endpoint: modelEndpoint,
          model_name: modelName,
          providerApiKey: useTempKeyForGen ? tempApiKey : undefined,
          providerBaseUrl: modelEndpoint || undefined,
          providerModelName: modelName || undefined
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
                <h2>Connect your model.</h2>
                <p>Choose a provider, paste your API key, and test the connection. No keys are permanently stored in the browser.</p>
              </div>

              <div className={styles.modelGrid}>
                {MODEL_ROUTES_META.map((provider) => {
                  const status = providerConfigs[provider.key] || {};
                  const isConfig = provider.key === "prompt" || provider.key === "template" || status.configured;
                  const isBYOK = provider.price === "BYOK";
                  
                  return (
                    <button
                      className={modelRoute === provider.key ? styles.selectedCard : ""}
                      key={provider.key}
                      onClick={() => { setModelRoute(provider.key); setTestResult(null); setShowAdvanced(false); }}
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
                      <p style={{ margin: "4px 0", fontSize: "0.88rem" }}>{provider.desc}</p>
                      <div style={{ display: "flex", alignItems: "center", fontSize: "0.8rem", fontWeight: "bold" }}>
                        <span className={`${styles.statusDot} ${isConfig ? styles.statusConfigured : isBYOK ? styles.statusNotConfigured : styles.statusLocal}`} />
                        {isConfig ? "Ready" : isBYOK ? "Key needed" : "Local server"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Selected Provider Detail Panel ── */}
              {(() => {
                const selectedMeta = MODEL_ROUTES_META.find(m => m.key === modelRoute);
                if (!selectedMeta) return null;
                const status = providerConfigs[modelRoute] || {};
                const isLocal = selectedMeta.badge === "Local";
                const isBYOK = selectedMeta.price === "BYOK";
                const needsKey = isBYOK && !isLocal && modelRoute !== "prompt" && modelRoute !== "template";
                const needsEndpoint = modelRoute === "ollama" || modelRoute === "lmstudio" || modelRoute === "custom";
                const isPromptOrTemplate = modelRoute === "prompt" || modelRoute === "template";

                if (isPromptOrTemplate) {
                  return (
                    <div className={styles.providerDetail}>
                      <h3>{selectedMeta.title}</h3>
                      <p>{selectedMeta.desc}</p>
                      <div className={styles.setupHint}>
                        <strong>✓ No configuration needed</strong>
                        {modelRoute === "prompt" 
                          ? "This mode generates a structured prompt you can copy and paste into any free chatbot (ChatGPT, Gemini, Claude). No API keys required."
                          : "This mode uses built-in deterministic templates for offline generation. No API keys or network calls needed."
                        }
                      </div>
                    </div>
                  );
                }

                return (
                  <div className={styles.providerDetail}>
                    <h3>{selectedMeta.title}</h3>
                    <p>{selectedMeta.desc}</p>

                    <div className={styles.connectionBox}>
                      {/* API Key field — shown for cloud BYOK providers */}
                      {needsKey && (
                        <label>
                          API Key {status.configured && <span style={{ color: "#24715d", fontSize: "0.82rem", fontWeight: 700 }}>(server key detected)</span>}
                          <input
                            className={styles.keyInput}
                            type="password"
                            placeholder={
                              modelRoute === "gemini" ? "Paste your Google AI Studio API key" :
                              modelRoute === "groq" ? "Paste your Groq Cloud API key" :
                              modelRoute === "openrouter" ? "Paste your OpenRouter API key" :
                              "Paste your API key"
                            }
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            autoComplete="off"
                          />
                          <span style={{ fontSize: "0.82rem", color: "#667069", marginTop: 2 }}>
                            {status.configured 
                              ? "A server-side key is already set. Paste a key here to override it for this session only."
                              : <>Set <code style={{ background: "rgba(18,22,18,0.06)", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", fontSize: "0.82rem" }}>{(status.requiredEnv || [])[0] || "API_KEY"}</code> in your <code style={{ background: "rgba(18,22,18,0.06)", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", fontSize: "0.82rem" }}>.env.local</code> for permanent use, or paste a key above for this session.</>
                            }
                          </span>
                        </label>
                      )}

                      {/* Endpoint field — shown by default for Ollama, LM Studio, Custom */}
                      {needsEndpoint && (
                        <label>
                          Endpoint URL
                          <input
                            className={styles.keyInput}
                            type="text"
                            placeholder={
                              modelRoute === "ollama" ? "http://localhost:11434/v1" :
                              modelRoute === "lmstudio" ? "http://localhost:1234/v1" :
                              "https://your-gateway.example.com/v1"
                            }
                            value={modelEndpoint}
                            onChange={(e) => setModelEndpoint(e.target.value)}
                          />
                        </label>
                      )}

                      {/* Use this key for generation checkbox */}
                      {needsKey && tempApiKey && (
                        <label className={styles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={useTempKeyForGen}
                            onChange={(e) => setUseTempKeyForGen(e.target.checked)}
                          />
                          Use this key for generation (session only — not stored)
                        </label>
                      )}

                      {/* Test Connection + Result */}
                      <div className={styles.connectionActions}>
                        {status.canTest !== false && (
                          <button
                            className={styles.testButton}
                            type="button"
                            disabled={isTestingConnection}
                            onClick={() => triggerTestConnection(modelRoute)}
                          >
                            {isTestingConnection ? "Testing..." : "⚡ Test Connection"}
                          </button>
                        )}

                        {testResult && (
                          <div className={`${styles.testResult} ${testResult.ok ? styles.testSuccess : styles.testFail}`}>
                            {testResult.ok ? "✓ Connected successfully" : `✗ ${testResult.error || "Connection failed"}`}
                          </div>
                        )}
                      </div>

                      {/* Setup hint on failure */}
                      {testResult && !testResult.ok && testResult.setupHint && (
                        <div className={styles.setupHint}>
                          <strong>Setup help</strong>
                          {testResult.setupHint}
                        </div>
                      )}

                      {/* Advanced Settings Toggle */}
                      {!needsEndpoint && (
                        <>
                          <button
                            className={styles.advancedToggle}
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                          >
                            {showAdvanced ? "▾" : "▸"} Advanced settings (endpoint & model override)
                          </button>
                          {showAdvanced && (
                            <div className={styles.advancedPanel}>
                              <label>
                                Endpoint override
                                <input
                                  className={styles.keyInput}
                                  type="text"
                                  placeholder="Leave empty to use the default provider endpoint"
                                  value={modelEndpoint}
                                  onChange={(e) => setModelEndpoint(e.target.value)}
                                />
                              </label>
                              <label>
                                Model name override
                                <input
                                  className={styles.keyInput}
                                  type="text"
                                  placeholder={status.defaultModel || "Leave empty for provider default"}
                                  value={modelName}
                                  onChange={(e) => setModelName(e.target.value)}
                                />
                              </label>
                            </div>
                          )}
                        </>
                      )}

                      {/* Model name field for endpoint-based providers */}
                      {needsEndpoint && (
                        <label>
                          Model name
                          <input
                            className={styles.keyInput}
                            type="text"
                            placeholder={status.defaultModel || "llama3, mistral, etc."}
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                          />
                        </label>
                      )}
                    </div>

                    {/* Env variable reference */}
                    {status.requiredEnv && status.requiredEnv.length > 0 && (
                      <div className={styles.setupHint} style={{ marginTop: 14 }}>
                        <strong>Environment variables for permanent setup</strong>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {status.requiredEnv.map(envVar => (
                            <span className={styles.envBadge} key={envVar}>{envVar}</span>
                          ))}
                        </div>
                        <span>Set these in <code>.env.local</code> (local dev) or Vercel Environment Variables (hosted deployment).</span>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                  {repoUrl && (
                    <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer", color: "#59635c" }}>
                        <input
                          type="checkbox"
                          checked={isPrivateRepo}
                          onChange={(e) => setIsPrivateRepo(e.target.checked)}
                        />
                        🔒 Private Repository?
                      </label>
                      {isPrivateRepo && (
                        <input
                          type="password"
                          placeholder="Paste GitHub Personal Access Token (PAT)"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          style={{ fontSize: "0.85rem", padding: "6px 10px", borderRadius: 4, border: "1px solid rgba(18,22,18,0.15)" }}
                        />
                      )}
                    </div>
                  )}
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
                    Live App URL (context only)
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        onChange={(event) => setAppUrl(event.target.value)}
                        placeholder="e.g. http://localhost:3000 or https://example.com"
                        type="text"
                        value={appUrl}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={autoCaptureScreenshot}
                        disabled={isCapturingScreenshot}
                        className={styles.secondaryButton}
                        style={{ minHeight: 42, padding: "0 16px", whiteSpace: "nowrap" }}
                      >
                        {isCapturingScreenshot ? "Capturing..." : "📷 Auto Capture"}
                      </button>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#667069", marginTop: 4 }}>
                      Use the backend Playwright module to capture a screenshot automatically, or copy-paste it from your clipboard.
                    </span>
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

              {appUrl && (
                <div style={{ marginTop: 15, marginBottom: 20 }}>
                  <span style={{ display: "block", fontSize: "0.95rem", fontWeight: "bold", marginBottom: 6, color: "#101410" }}>
                    Interactive Web Preview (No Playwright required)
                  </span>
                  <div style={{ position: "relative", width: "100%", height: "400px", border: "1px solid rgba(18,22,18,0.15)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                    <iframe
                      src={appUrl}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#667069", display: "block", marginTop: 4 }}>
                    You can interact with your application above. To record a demo or grab a screenshot, start the "Record Screen Demonstration" below and select this window.
                  </span>
                </div>
              )}

              <label className={styles.field} style={{ marginTop: 20 }}>
                Pasted document content
                <textarea
                  onChange={(event) => setDocumentText(event.target.value)}
                  placeholder="Paste changelogs, full logs, text files, or raw copy briefs here."
                  rows={4}
                  value={documentText}
                />
              </label>

              <div style={{ background: "#ede7db", border: "1px solid rgba(18,22,18,0.1)", padding: "12px 18px", borderRadius: 8, color: "#59635c", fontSize: "0.95rem", fontWeight: "bold", margin: "20px 0" }}>
                💡 <strong>Notice</strong>: For now, upload screenshots or record your screen manually. Automatic app capture and AI video generation are future modules.
              </div>

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
                      <div className={styles.cardTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h3 style={{ margin: 0 }}>Visual Asset & Previews</h3>
                        <div style={{ display: "flex", background: "rgba(18,22,18,0.05)", padding: 3, borderRadius: 6 }}>
                          <button
                            type="button"
                            onClick={() => setRightPanelTab("svg")}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.8rem",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              background: rightPanelTab === "svg" ? "#ffffff" : "transparent",
                              color: rightPanelTab === "svg" ? "#101410" : "#59635c",
                              fontWeight: "bold",
                              boxShadow: rightPanelTab === "svg" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                            }}
                          >
                            SVG Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setRightPanelTab("preview")}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.8rem",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              background: rightPanelTab === "preview" ? "#ffffff" : "transparent",
                              color: rightPanelTab === "preview" ? "#101410" : "#59635c",
                              fontWeight: "bold",
                              boxShadow: rightPanelTab === "preview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                            }}
                          >
                            Feed Preview
                          </button>
                        </div>
                      </div>

                      {rightPanelTab === "svg" ? (
                        imageSrc ? (
                          <img className={styles.visualAsset} src={imageSrc} alt="Generated visual card mockup" />
                        ) : (
                          <div className={styles.emptyAsset}>No visual asset preview available.</div>
                        )
                      ) : (
                        renderSocialPreview(activeChannel, currentPost, result?.package || result?.json, imageSrc)
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
                      <strong>Reels/Shorts Script</strong>
                      <ol style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.85rem" }}>
                        {result?.package?.media?.videoScript?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No script compiled</li>}
                      </ol>
                    </article>

                    <article>
                      <span>Voiceover Script</span>
                      <strong>Speech Voiceover</strong>
                      <ol style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.85rem" }}>
                        {result?.package?.media?.voiceoverScript?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No voiceover script compiled</li>}
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
                      <span>Recording Guide</span>
                      <strong>Demo Screen guide</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.recordingGuide?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No screen guide compiled</li>}
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
                      <span>Thumbnail Ideas</span>
                      <strong>Visual layouts</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.thumbnailIdeas?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No thumbnail ideas compiled</li>}
                      </ul>
                    </article>

                    <article>
                      <span>Video Timeline</span>
                      <strong>Video Editing Timeline</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.media?.videoTimeline?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No timeline compiled</li>}
                      </ul>
                    </article>

                    <article>
                      <span>Publishing Checklist</span>
                      <strong>Handoff checklist</strong>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#59635c", fontSize: "0.9rem" }}>
                        {result?.package?.publishing?.platformChecklist?.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        )) || <li>No platform checklist compiled</li>}
                      </ul>
                    </article>

                    <article style={{ gridColumn: "span 2" }}>
                      <span>Thumbnail Prompt</span>
                      <strong>Generation prompt</strong>
                      <p style={{ color: "#59635c", fontSize: "0.9rem", margin: 0, whiteSpace: "pre-wrap", fontStyle: "italic" }}>
                        {result?.package?.media?.thumbnailPrompt || "No thumbnail prompt compiled"}
                      </p>
                    </article>

                    <article style={{ gridColumn: "span 3" }}>
                      <span>Future Video Generation Config</span>
                      <strong>Video Prompt JSON</strong>
                      <pre style={{ margin: "5px 0 0", maxHeight: "250px", overflow: "auto", background: "#171b18", color: "#f4f7f2", padding: 12, borderRadius: 6, fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {result?.package?.media?.videoPrompt ? JSON.stringify(result.package.media.videoPrompt, null, 2) : "No video prompt configuration compiled."}
                      </pre>
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

                  {/* ── Connected Accounts ── */}
                  <div className={styles.socialSection}>
                    <h3>Connected Accounts</h3>
                    <p>Connect your social media accounts to publish directly from SignalFlow Studio.</p>

                    {oauthMessage && (
                      <div className={`${styles.oauthMessage} ${oauthMessage.type === "success" ? styles.oauthSuccess : styles.oauthError}`}>
                        {oauthMessage.type === "success" ? "✓" : "✗"} {oauthMessage.message}
                        <button
                          type="button"
                          onClick={() => setOauthMessage(null)}
                          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", opacity: 0.6 }}
                        >×</button>
                      </div>
                    )}

                    <div className={styles.socialGrid}>
                      {Object.entries(socialAccounts).map(([key, account]) => (
                        <div className={styles.socialCard} key={key}>
                          <div className={styles.socialCardHeader}>
                            <span className={styles.socialIcon} style={{ background: account.color || "#333" }}>
                              {account.icon || key.charAt(0).toUpperCase()}
                            </span>
                            <strong>{account.label || key}</strong>
                          </div>

                          {account.manualOnly ? (
                            <>
                              <div className={`${styles.socialCardStatus} ${styles.socialCardStatusManual}`}>
                                <span className={`${styles.statusDot} ${styles.statusLocal}`} />
                                Manual only
                              </div>
                              <p className={styles.socialManualNote}>{account.reason}</p>
                            </>
                          ) : account.connected ? (
                            <>
                              <div className={`${styles.socialCardStatus} ${styles.socialCardStatusConnected}`}>
                                <span className={`${styles.statusDot} ${styles.statusConfigured}`} />
                                Connected{account.expired ? " (expired)" : ""}
                              </div>
                              {account.profile && (
                                <div className={styles.socialCardProfile}>
                                  {account.profile.name || account.profile.username || ""}
                                </div>
                              )}
                              <div className={styles.socialCardActions}>
                                <button
                                  type="button"
                                  className={styles.socialDisconnectBtn}
                                  onClick={() => handleSocialDisconnect(key)}
                                >Disconnect</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={`${styles.socialCardStatus} ${styles.socialCardStatusDisconnected}`}>
                                <span className={`${styles.statusDot} ${styles.statusNotConfigured}`} />
                                {account.configured ? "Not connected" : "OAuth not configured"}
                              </div>
                              <div className={styles.socialCardActions}>
                                {account.configured ? (
                                  <button
                                    type="button"
                                    className={styles.socialConnectBtn}
                                    onClick={() => handleSocialConnect(key)}
                                  >🔗 Connect {account.label}</button>
                                ) : (
                                  <button
                                    type="button"
                                    className={styles.socialConnectBtn}
                                    onClick={() => setSocialSetupExpanded(socialSetupExpanded === key ? null : key)}
                                  >📋 Setup Instructions</button>
                                )}
                              </div>
                              {socialSetupExpanded === key && account.setupSteps && (
                                <ol className={styles.socialSetupSteps}>
                                  {account.setupSteps.map((s, i) => <li key={i}>{s}</li>)}
                                </ol>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Publish / Post Section ── */}
                  <h3 style={{ marginTop: 40, marginBottom: 15 }}>Publish or Export</h3>

                  <div className={styles.publishPanel}>
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
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {isSocialConnected ? (
                          <span style={{ fontSize: "0.85rem", padding: "4px 10px", borderRadius: 4, background: "rgba(36,113,93,0.08)", color: "#24715d", fontWeight: "bold" }}>
                            ✓ {socialAccounts[publishPlatform]?.label} connected
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.85rem", padding: "4px 10px", borderRadius: 4, background: "#ede7db", color: "#667069", fontWeight: "bold" }}>
                            Manual mode — copy & paste
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reddit-specific fields */}
                    {publishPlatform === "reddit" && isSocialConnected && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <label className={styles.field}>
                          Subreddit
                          <input
                            type="text"
                            placeholder="e.g. SideProject, webdev, programming"
                            value={redditSubreddit}
                            onChange={(e) => setRedditSubreddit(e.target.value)}
                          />
                        </label>
                        <label className={styles.field}>
                          Post Title
                          <input
                            type="text"
                            placeholder={projectName || "Post title"}
                            value={redditTitle}
                            onChange={(e) => setRedditTitle(e.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    <div style={{ background: "#171b18", padding: 15, borderRadius: 8, color: "#f4f7f2", fontSize: "0.9rem" }}>
                      <strong style={{ display: "block", color: "#38bdf8", marginBottom: 8 }}>Final Content (Copy-ready):</strong>
                      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{result?.posts?.[publishPlatform] || "No content compiled."}</pre>
                    </div>

                    <div className={styles.publishActions}>
                      {isSocialConnected && (
                        <button
                          className={styles.publishBtn}
                          type="button"
                          disabled={isPublishingToApi}
                          onClick={handlePublishAction}
                        >
                          {isPublishingToApi ? "Publishing..." : `🚀 Publish to ${socialAccounts[publishPlatform]?.label || publishPlatform}`}
                        </button>
                      )}

                      <button
                        className={styles.primaryButton}
                        onClick={() => copyText("publish", result?.posts?.[publishPlatform])}
                        type="button"
                      >
                        {copiedLabel === "publish" ? "✓ Copied!" : "📋 Copy Post Text"}
                      </button>

                      <button
                        className={styles.secondaryButton}
                        onClick={() => triggerExport("/api/export/zip", "zip")}
                        type="button"
                      >
                        Download ZIP
                      </button>
                    </div>

                    {/* Publish result */}
                    {publishStatusMsg && (() => {
                      try {
                        const parsed = JSON.parse(publishStatusMsg);
                        return (
                          <div className={`${styles.publishResult} ${styles.publishSuccess}`}>
                            ✓ {parsed.message}
                            {parsed.postUrl && (
                              <> — <a href={parsed.postUrl} target="_blank" rel="noopener noreferrer">View post ↗</a></>
                            )}
                          </div>
                        );
                      } catch {
                        return (
                          <div className={`${styles.publishResult} ${publishStatusMsg.startsWith("Error") ? styles.publishError : styles.publishSuccess}`}>
                            {publishStatusMsg}
                          </div>
                        );
                      }
                    })()}

                    {/* Prepared package info */}
                    {preparedPackage && (
                      <div style={{ background: "#fff", border: "1px solid rgba(18,22,18,0.1)", padding: 18, borderRadius: 8, display: "grid", gap: 12 }}>
                        <strong style={{ color: "#24715d" }}>
                          📋 Posting Checklist ({(socialAccounts[publishPlatform]?.label || publishPlatform).toUpperCase()})
                        </strong>

                        {preparedPackage.hashtags && preparedPackage.hashtags.length > 0 && (
                          <div style={{ fontSize: "0.9rem" }}>
                            <strong>Hashtags:</strong> {preparedPackage.hashtags.map(h => `#${h}`).join(" ")}
                          </div>
                        )}

                        {preparedPackage.assetsNeeded && preparedPackage.assetsNeeded.length > 0 && (
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>Assets to attach:</strong>
                            <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: "#59635c", fontSize: "0.85rem" }}>
                              {preparedPackage.assetsNeeded.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          </div>
                        )}

                        {preparedPackage.manualChecklist && preparedPackage.manualChecklist.length > 0 && (
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>Checklist:</strong>
                            <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: "#59635c", fontSize: "0.85rem" }}>
                              {preparedPackage.manualChecklist.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
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

function renderSocialPreview(channel, content, packageData, imgBase64) {
  if (channel === "linkedin") {
    return (
      <div style={{ background: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", color: "#191919", fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: "14px", lineHeight: "1.4", textAlign: "left" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#0077b5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
            {packageData?.project?.name?.substring(0, 2).toUpperCase() || "SF"}
          </div>
          <div>
            <div style={{ fontWeight: "bold", color: "#000" }}>{packageData?.project?.name || "SignalFlow Studio"}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>Product launch update • 1st</div>
          </div>
        </div>
        <div style={{ whiteSpace: "pre-wrap", marginBottom: "12px", maxHeight: "250px", overflowY: "auto" }}>{content}</div>
        {imgBase64 && (
          <div style={{ border: "1px solid #e0e0e0", borderRadius: "4px", overflow: "hidden", background: "#f3f6f8" }}>
            <img src={imgBase64} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}
      </div>
    );
  }

  if (channel === "x") {
    const tweets = content.split(/\n\n+/).filter(Boolean);
    return (
      <div style={{ background: "#000000", border: "1px solid #2f3336", borderRadius: "16px", padding: "16px", color: "#e7e9ea", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", textAlign: "left", maxHeight: "400px", overflowY: "auto" }}>
        {tweets.map((tweet, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", position: "relative", marginBottom: i < tweets.length - 1 ? "24px" : "0" }}>
            {i < tweets.length - 1 && (
              <div style={{ position: "absolute", left: "19px", top: "40px", bottom: "-24px", width: "2px", background: "#2f3336" }} />
            )}
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2f3336", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
              {packageData?.project?.name?.substring(0, 1).toUpperCase() || "S"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontWeight: "bold", color: "#e7e9ea" }}>{packageData?.project?.name || "SignalFlow Studio"}</span>
                <span style={{ color: "#71767b", fontSize: "14px" }}>@{packageData?.project?.name?.toLowerCase().replace(/\s+/g, "") || "signalflow"} · {i + 1}</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: "15px", lineHeight: "1.5" }}>{tweet}</div>
              {i === 0 && imgBase64 && (
                <div style={{ border: "1px solid #2f3336", borderRadius: "16px", overflow: "hidden", marginTop: "12px" }}>
                  <img src={imgBase64} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (channel === "instagram") {
    return (
      <div style={{ background: "#ffffff", border: "1px solid #dbdbdb", borderRadius: "3px", color: "#262626", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2px", boxSizing: "border-box" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
              {packageData?.project?.name?.substring(0, 1).toUpperCase() || "S"}
            </div>
          </div>
          <strong style={{ marginLeft: "10px", fontSize: "14px", color: "#000" }}>{packageData?.project?.name?.toLowerCase().replace(/\s+/g, "_") || "signalflow_studio"}</strong>
        </div>
        {imgBase64 ? (
          <div style={{ background: "#fafafa", borderTop: "1px solid #efefef", borderBottom: "1px solid #efefef" }}>
            <img src={imgBase64} style={{ width: "100%", aspectRatio: "1", objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "1", background: "#efefef", display: "flex", alignItems: "center", justifyContent: "center", color: "#8e8e8e" }}>
            No image card attached
          </div>
        )}
        <div style={{ padding: "14px", fontSize: "14px", lineHeight: "1.4", maxHeight: "150px", overflowY: "auto" }}>
          <div style={{ marginBottom: "8px" }}>
            <strong style={{ color: "#000" }}>{packageData?.project?.name?.toLowerCase().replace(/\s+/g, "_") || "signalflow_studio"}</strong>{" "}
            <span style={{ whiteSpace: "pre-wrap", color: "#262626" }}>{content}</span>
          </div>
        </div>
      </div>
    );
  }

  if (channel === "reddit") {
    return (
      <div style={{ background: "#ffffff", border: "1px solid #ccc", borderRadius: "4px", padding: "16px", color: "#1a1a1b", fontFamily: "IBMPlexSans, Arial, sans-serif", textAlign: "left" }}>
        <div style={{ fontSize: "12px", color: "#787c7e", marginBottom: "8px" }}>
          Posted by u/{packageData?.project?.name?.toLowerCase().replace(/\s+/g, "_") || "creator"} in r/sideproject 5 hours ago
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 10px 0", color: "#222" }}>
          {packageData?.posts?.reddit?.title || "Check out " + (packageData?.project?.name || "my project")}
        </h3>
        <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.5", maxHeight: "250px", overflowY: "auto" }}>{content}</div>
      </div>
    );
  }

  // Default simple card fallback for blog, release notes, newsletter, etc.
  return (
    <div style={{ background: "#fafaf9", border: "1px solid rgba(18,22,18,0.1)", borderRadius: "8px", padding: "20px", color: "#1c1917", textAlign: "left", maxHeight: "400px", overflowY: "auto" }}>
      <h4 style={{ margin: "0 0 10px 0", color: "#111", fontSize: "1rem", fontWeight: "bold" }}>
        {channel.toUpperCase().replace("_", " ")} Document Format Preview
      </h4>
      <div style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "0.95rem", lineHeight: "1.6" }}>{content}</div>
    </div>
  );
}
