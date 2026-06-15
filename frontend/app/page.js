"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";
const PRODUCT_NAME = "SignalFlow Studio";
const ACCESS_TOKEN_STORAGE_KEY = "signalflow_owner_token";

const MODEL_ROUTES = [
  ["prompt", "Free chatbot", "Copy a clean prompt into any chatbot."],
  ["local", "Local SLM", "Use Ollama, LM Studio, or a local OpenAI-compatible server."],
  ["api", "API model", "Connect your own OpenAI-compatible endpoint."],
  ["cloud", "Cloud gateway", "Use your hosted model or workflow endpoint."],
];

const CHANNELS = [
  ["linkedin", "LinkedIn"],
  ["x", "X"],
  ["instagram", "Instagram"],
  ["reddit", "Reddit"],
  ["hn", "Hacker News"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["newsletter", "Newsletter"],
  ["blog", "Blog"],
  ["release_notes", "Release notes"],
  ["discord", "Discord"],
  ["slack", "Slack"],
];

const OUTPUT_TYPES = [
  ["caption", "Captions"],
  ["text", "Posts"],
  ["thread", "Threads"],
  ["image", "Images"],
  ["video", "Video plan"],
  ["gif", "GIF plan"],
  ["carousel", "Carousel"],
  ["doc", "Doc"],
];

const STEPS = ["Model", "Inputs", "Outputs", "Package"];

const DEFAULT_RESULT = {
  project_name: PRODUCT_NAME,
  posts: {
    linkedin: "Connect a model, add context, choose outputs, and generate a ready-to-review package.",
  },
  channels: ["linkedin"],
  outputs: ["caption", "text", "image"],
  markdown: `# ${PRODUCT_NAME} package\n\nYour generated package will appear here.`,
  media_plan: [
    {
      type: "image",
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
};

export default function Home() {
  const videoPreviewRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const [step, setStep] = useState(0);
  const [modelRoute, setModelRoute] = useState("prompt");
  const [modelEndpoint, setModelEndpoint] = useState("");
  const [modelName, setModelName] = useState("copy-paste prompt");
  const [apiKeyPresent, setApiKeyPresent] = useState(false);
  const [brief, setBrief] = useState("");
  const [links, setLinks] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(["linkedin", "x", "instagram", "newsletter"]);
  const [selectedOutputs, setSelectedOutputs] = useState(["caption", "text", "image", "video", "doc"]);
  const [audience, setAudience] = useState("builders, founders, creators, and technical teams");
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

  useEffect(() => {
    setAccessToken(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "");
    checkHealth();
  }, []);

  const visibleChannels = useMemo(() => {
    const available = Object.keys(result?.posts || {});
    return CHANNELS.filter(([key]) => available.includes(key));
  }, [result]);

  const sourceCount = useMemo(
    () =>
      [brief.trim(), links.trim(), repoUrl.trim(), fileNames.length, mediaItems.length].filter(Boolean).length,
    [brief, fileNames.length, links, mediaItems.length, repoUrl],
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

  function authHeaders() {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
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
      setAccessMessage(`Unlocked for ${data.expires_in_days || 30} days on this browser.`);
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
    setFileNames(Array.from(event.target.files || []).map((file) => file.name));
  }

  function addMediaItem(item) {
    setMediaItems((current) => [item, ...current].slice(0, 8));
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
        addMediaItem({
          type: "screen recording",
          name: `recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`,
          url: URL.createObjectURL(blob),
        });
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
      setError("Start screen recording before taking a screenshot.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Could not create screenshot.");
        return;
      }
      addMediaItem({
        type: "screenshot",
        name: `screenshot-${new Date().toISOString().replace(/[:.]/g, "-")}.png`,
        url: URL.createObjectURL(blob),
      });
      setCaptureStatus("Screenshot saved");
    }, "image/png");
  }

  async function generatePackage(event) {
    event.preventDefault();
    if (accessLocked && !accessToken) {
      setError("Enter the owner key before generating on this hosted demo.");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const resp = await fetch(`${API_BASE}/launch_kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          input_type: "mixed",
          notes: brief,
          research_url: links,
          repo: repoUrl,
          document_text: fileNames.join(", "),
          media_items: mediaItems.map((item) => ({ type: item.type, name: item.name })),
          channels: selectedChannels,
          output_types: selectedOutputs,
          audience,
          project_name: PRODUCT_NAME,
          generator: modelRoute,
          model_endpoint: modelEndpoint,
          model_name: modelName,
          api_key_present: apiKeyPresent,
        }),
      });
      const data = await resp.json();

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
      setError(generateError.message);
    } finally {
      setIsGenerating(false);
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
      setError("Clipboard access was blocked. Select the text and copy it manually.");
    }
  }

  const imageSrc = result?.image_base64
    ? `data:${result.image_mime || "image/svg+xml"};base64,${result.image_base64}`
    : "";
  const currentPost = result?.posts?.[activeChannel] || "";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brandMark}>SF</div>
        <p className={styles.eyebrow}>{PRODUCT_NAME}</p>
        <h1>Inputs in. Finished content out.</h1>
        <p>
          Connect your model, add whatever context you have, choose the formats,
          and get a clean package of captions, visuals, docs, and channel drafts.
        </p>
      </section>

      {accessLocked && (
        <section className={styles.accessPanel}>
          <div>
            <p className={styles.eyebrow}>Private hosted demo</p>
            <h2>{accessToken ? "Owner session active" : "Unlock generation"}</h2>
          </div>
          {accessToken ? (
            <button
              className={styles.secondaryButton}
              onClick={() => {
                window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                setAccessToken("");
              }}
              type="button"
            >
              Lock browser
            </button>
          ) : (
            <form className={styles.accessForm} onSubmit={unlockWorkspace}>
              <input
                aria-label="Owner access key"
                onChange={(event) => setAccessKey(event.target.value)}
                placeholder="Owner access key"
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
                <h2>Connect how the content should be generated.</h2>
                <p>Start simple with a chatbot prompt, or connect your local SLM/LLM route when you are ready.</p>
              </div>

              <div className={styles.modelGrid}>
                {MODEL_ROUTES.map(([key, title, body]) => (
                  <button
                    className={modelRoute === key ? styles.selectedCard : ""}
                    key={key}
                    onClick={() => setModelRoute(key)}
                    type="button"
                  >
                    <span>{title}</span>
                    <p>{body}</p>
                  </button>
                ))}
              </div>

              {modelRoute !== "prompt" && (
                <div className={styles.softBox}>
                  <label className={styles.field}>
                    Endpoint
                    <input
                      onChange={(event) => setModelEndpoint(event.target.value)}
                      placeholder="http://localhost:11434/v1 or https://api.example.com/v1"
                      value={modelEndpoint}
                    />
                  </label>
                  <label className={styles.field}>
                    Model name
                    <input
                      onChange={(event) => setModelName(event.target.value)}
                      placeholder="llama3, qwen, gpt-4o-mini, custom"
                      value={modelName}
                    />
                  </label>
                  <label className={styles.checkRow}>
                    <input
                      checked={apiKeyPresent}
                      onChange={(event) => setApiKeyPresent(event.target.checked)}
                      type="checkbox"
                    />
                    I will provide my key through my own deployment or local setup.
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
                <p>Text, links, docs, repo, screenshots, recordings. Add only what you have.</p>
              </div>

              <label className={styles.heroInput}>
                Main description
                <textarea
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder="What happened? What should people understand? What should be created?"
                  rows={9}
                  value={brief}
                />
              </label>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  Links
                  <textarea
                    onChange={(event) => setLinks(event.target.value)}
                    placeholder="Research links, product URLs, demos, docs"
                    rows={4}
                    value={links}
                  />
                </label>
                <label className={styles.field}>
                  GitHub repo
                  <textarea
                    onChange={(event) => setRepoUrl(event.target.value)}
                    placeholder="https://github.com/user/repo"
                    rows={4}
                    value={repoUrl}
                  />
                </label>
              </div>

              <div className={styles.mediaGrid}>
                <label className={styles.uploadTile}>
                  <input multiple onChange={handleFiles} type="file" />
                  <strong>Attach docs or assets</strong>
                  <span>{fileNames.length ? fileNames.join(", ") : "PDF, notes, images, briefs, logs"}</span>
                </label>
                <div className={styles.captureTile}>
                  <strong>Capture product media</strong>
                  <span>{captureStatus}</span>
                  <div className={styles.miniActions}>
                    <button className={styles.secondaryButton} onClick={startScreenCapture} type="button">
                      Record
                    </button>
                    <button className={styles.secondaryButton} onClick={captureScreenshot} type="button">
                      Screenshot
                    </button>
                    <button className={styles.secondaryButton} onClick={stopScreenCapture} type="button">
                      Stop
                    </button>
                  </div>
                  <video className={styles.preview} muted playsInline ref={videoPreviewRef} />
                </div>
              </div>

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
                <h2>Choose what you want back.</h2>
                <p>Pick the formats and places. SignalFlow creates the package in one run.</p>
              </div>

              <label className={styles.field}>
                Audience
                <input onChange={(event) => setAudience(event.target.value)} value={audience} />
              </label>

              <div className={styles.pickGroup}>
                <h3>Formats</h3>
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
                <h3>Channels</h3>
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
                <span>{sourceCount || 0} input groups</span>
                <span>{selectedOutputs.length} formats</span>
                <span>{selectedChannels.length} channels</span>
              </div>

              <div className={styles.actions}>
                <button className={styles.secondaryButton} onClick={() => setStep(1)} type="button">
                  Back
                </button>
                <button className={styles.primaryButton} disabled={isGenerating || (accessLocked && !accessToken)}>
                  {isGenerating ? "Creating package..." : "Generate package"}
                </button>
              </div>
              {error && <p className={styles.errorText}>{error}</p>}
            </section>
          )}

          {step === 3 && (
            <section className={styles.panel}>
              <div className={styles.panelIntro}>
                <p className={styles.eyebrow}>Step 4</p>
                <h2>{hasGenerated ? "Your package is ready." : "Generate when ready."}</h2>
                <p>Review, copy, and use the generated material wherever you publish.</p>
              </div>

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
                  <span>assets</span>
                </div>
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
                    <h3>{CHANNELS.find(([key]) => key === activeChannel)?.[1] || "Channel"} draft</h3>
                    <button className={styles.secondaryButton} onClick={() => copyText("post", currentPost)} type="button">
                      {copiedLabel === "post" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre>{currentPost}</pre>
                </article>

                <article className={styles.outputCard}>
                  <div className={styles.cardTitle}>
                    <h3>Visual asset</h3>
                    <span>{result?.assets?.code_image || "post-card.svg"}</span>
                  </div>
                  {imageSrc ? (
                    <img className={styles.visualAsset} src={imageSrc} alt="Generated social visual" />
                  ) : (
                    <div className={styles.emptyAsset}>Generate to preview visuals.</div>
                  )}
                </article>
              </div>

              <div className={styles.assetGrid}>
                {(result?.media_plan || []).map((item) => (
                  <article key={`${item.type}-${item.title}`}>
                    <span>{item.type}</span>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </article>
                ))}
                {(result?.documents || []).map((item) => (
                  <article key={item.title}>
                    <span>doc</span>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </article>
                ))}
              </div>

              <div className={styles.actions}>
                <button className={styles.secondaryButton} onClick={() => setStep(2)} type="button">
                  Edit outputs
                </button>
                <button className={styles.primaryButton} onClick={() => copyText("markdown", result.markdown)} type="button">
                  {copiedLabel === "markdown" ? "Copied" : "Copy full package"}
                </button>
              </div>
            </section>
          )}
        </form>
      </section>
    </main>
  );
}
