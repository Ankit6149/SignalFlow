"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";
const PRODUCT_NAME = "SignalFlow Studio";
const ACCESS_TOKEN_STORAGE_KEY = "signalflow_owner_token";

const INPUT_TYPES = [
  ["text", "Text or idea"],
  ["links", "Links"],
  ["docs", "Docs"],
  ["repo", "GitHub repo"],
  ["media", "Screenshots / recordings"],
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

const DEFAULT_RESULT = {
  project_name: PRODUCT_NAME,
  posts: {
    linkedin:
      "Describe what you built, add links or assets, choose outputs, and SignalFlow Studio prepares a complete posting package.",
    x: "One input -> channel-ready captions, visuals, docs, and handoff files.",
    instagram: "Turn product context into captions, image directions, video hooks, and carousel slides.",
  },
  channels: ["linkedin", "x", "instagram"],
  outputs: ["caption", "text", "image", "video"],
  markdown: `# ${PRODUCT_NAME} package\n\nAdd inputs, choose outputs, and generate a reviewable post kit.`,
  chatbot_prompt: `Create a complete social content package for ${PRODUCT_NAME}.`,
  media_plan: [
    {
      type: "image",
      title: "Generated visual card",
      summary: "Use the strongest product signal as a clean social image.",
    },
    {
      type: "video",
      title: "Short demo clip",
      summary: "Record the core workflow and convert it into a 10-20 second product clip.",
    },
  ],
  documents: [
    {
      title: "Posting brief",
      summary: "A structured doc with angle, audience, channels, captions, and visual instructions.",
    },
  ],
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

  const [brief, setBrief] = useState(
    "Describe what changed, what data matters, and what the audience should understand.",
  );
  const [links, setLinks] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([
    "linkedin",
    "x",
    "instagram",
    "reddit",
    "newsletter",
    "blog",
  ]);
  const [selectedOutputs, setSelectedOutputs] = useState([
    "caption",
    "text",
    "image",
    "video",
    "carousel",
    "doc",
  ]);
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

  useEffect(() => {
    setAccessToken(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "");
    checkHealth();
  }, []);

  const visibleChannels = useMemo(() => {
    const available = Object.keys(result?.posts || {});
    return CHANNELS.filter(([key]) => available.includes(key));
  }, [result]);

  const inputSummary = useMemo(
    () => [
      brief.trim() ? "description" : "",
      links.trim() ? "links" : "",
      repoUrl.trim() ? "repo" : "",
      fileNames.length ? `${fileNames.length} docs` : "",
      mediaItems.length ? `${mediaItems.length} media` : "",
    ].filter(Boolean),
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
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
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
        <div>
          <p className={styles.eyebrow}>{PRODUCT_NAME}</p>
          <h1>Drop the context. Get the finished posting package.</h1>
          <p>
            Give it text, links, docs, repo context, screenshots, or recordings.
            Choose what you want back: captions, posts, images, video ideas,
            GIF plans, carousels, docs, or channel-ready exports.
          </p>
        </div>
        <div className={styles.heroFlow} aria-label="Product flow">
          {["Inputs", "Understand", "Create", "Package"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {accessLocked && (
        <section className={styles.accessPanel}>
          <div>
            <p className={styles.eyebrow}>Private hosted demo</p>
            <h2>{accessToken ? "Owner session active" : "Unlock generation"}</h2>
            <p>The UI is public. Generation is private on your hosted link.</p>
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

      <form className={styles.workspace} onSubmit={generatePackage}>
        <section className={styles.inputPanel}>
          <div className={styles.sectionHeader}>
            <span>1</span>
            <div>
              <p className={styles.eyebrow}>Inputs</p>
              <h2>Send anything useful</h2>
              <p>Only add what you have. Empty fields are ignored.</p>
            </div>
          </div>

          <div className={styles.inputTypes}>
            {INPUT_TYPES.map(([key, label]) => (
              <span key={key}>{label}</span>
            ))}
          </div>

          <label className={styles.bigField}>
            Description, notes, changelog, idea, raw brief
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={8} />
          </label>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              Links or research URLs
              <textarea
                value={links}
                onChange={(event) => setLinks(event.target.value)}
                placeholder="Paste one or many URLs"
                rows={5}
              />
            </label>
            <label className={styles.field}>
              GitHub repo or project link
              <textarea
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/user/repo"
                rows={5}
              />
            </label>
          </div>

          <div className={styles.uploadGrid}>
            <label className={styles.uploadBox}>
              <input multiple onChange={handleFiles} type="file" />
              <strong>Attach docs or assets</strong>
              <span>{fileNames.length ? fileNames.join(", ") : "PDF, notes, images, logs, briefs"}</span>
            </label>
            <div className={styles.captureBox}>
              <div>
                <strong>Record or screenshot</strong>
                <span>{captureStatus}</span>
              </div>
              <div className={styles.captureActions}>
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
        </section>

        <section className={styles.choicePanel}>
          <div className={styles.sectionHeader}>
            <span>2</span>
            <div>
              <p className={styles.eyebrow}>Outputs</p>
              <h2>Choose what you want back</h2>
              <p>Pick formats and channels. The app prepares everything together.</p>
            </div>
          </div>

          <label className={styles.field}>
            Audience
            <input value={audience} onChange={(event) => setAudience(event.target.value)} />
          </label>

          <div>
            <h3>Result formats</h3>
            <div className={styles.optionGrid}>
              {OUTPUT_TYPES.map(([key, label]) => (
                <button
                  className={selectedOutputs.includes(key) ? styles.selected : ""}
                  key={key}
                  onClick={() => toggleValue(key, setSelectedOutputs)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3>Channels</h3>
            <div className={styles.channelGrid}>
              {CHANNELS.map(([key, label]) => (
                <button
                  className={selectedChannels.includes(key) ? styles.selected : ""}
                  key={key}
                  onClick={() => toggleValue(key, setSelectedChannels)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.readyBox}>
            <strong>{inputSummary.length ? inputSummary.join(" + ") : "Waiting for input"}</strong>
            <span>
              {selectedOutputs.length} formats for {selectedChannels.length} channels
            </span>
          </div>

          <button className={styles.primaryButton} disabled={isGenerating || (accessLocked && !accessToken)}>
            {isGenerating ? "Creating package..." : "Generate package"}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </section>
      </form>

      <section className={styles.results}>
        <div className={styles.resultTop}>
          <div>
            <p className={styles.eyebrow}>Results</p>
            <h2>Ready-to-review package</h2>
          </div>
          <button className={styles.secondaryButton} onClick={() => copyText("markdown", result.markdown)} type="button">
            {copiedLabel === "markdown" ? "Copied" : "Copy full doc"}
          </button>
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
            <span>visual assets</span>
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
              <h3>Image / visual</h3>
              <span>{result?.assets?.code_image || "generated asset"}</span>
            </div>
            {imageSrc ? (
              <img className={styles.visualAsset} src={imageSrc} alt="Generated social visual" />
            ) : (
              <div className={styles.emptyAsset}>Generate to preview visual assets.</div>
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
      </section>
    </main>
  );
}
