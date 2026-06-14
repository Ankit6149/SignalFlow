"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";

const CHANNELS = [
  ["linkedin", "LinkedIn"],
  ["x", "X"],
  ["instagram", "Instagram"],
  ["blog", "Blog"],
  ["newsletter", "Newsletter"],
  ["release_notes", "Release notes"],
];

const INPUT_MODES = [
  ["brief", "Raw brief"],
  ["repo", "Git repo"],
  ["research", "URL/PDF notes"],
];

const sampleResult = {
  project_name: "SignalFlow",
  output_dir: "pipeline-output/signalflow-demo",
  highlights: [
    {
      path: "assets",
      score: 1,
      summary:
        "Assets supplied from notes; starts with: Turn code, notes, and launch context into channel-ready content.",
    },
  ],
  channels: ["linkedin", "x", "newsletter"],
  generator: "chatbot",
  chatbot_prompt:
    "You are helping create content for SignalFlow.\nAudience: builders and technical founders.\nChannels: LinkedIn, X, Newsletter.\nUse the supplied assets and return one section per channel.",
  posts: {
    linkedin:
      "I am building SignalFlow, a simple way to turn raw product work into channel-ready content.\n\nAdd assets, choose channels, generate drafts, then review before publishing.",
    x:
      "SignalFlow turns rough work into publish-ready drafts.\n\nAssets in. Channels selected. Content out.",
    newsletter:
      "Subject: SignalFlow update\n\nSignalFlow now helps builders turn notes, code, and launch context into channel-specific drafts.",
  },
  markdown: "# SignalFlow Kit\n\nReady-to-edit drafts for selected channels.",
  assets: {
    code_image: "pipeline-output/signalflow-demo/signal-card.png",
    markdown: "pipeline-output/signalflow-demo/signalflow-kit.md",
    summary: "pipeline-output/signalflow-demo/signalflow-kit.json",
  },
  integration_notes: [
    "Use assets as input for a local SLM, API model, or free chatbot.",
    "Selected channels control the format of generated drafts.",
    "Review before publishing.",
  ],
};

export default function Home() {
  const [sourceMode, setSourceMode] = useState("brief");
  const [repoPath, setRepoPath] = useState("");
  const [notes, setNotes] = useState(
    "SignalFlow helps builders turn product work into content.\nAssets can be launch notes, code snippets, changelogs, screenshots, or repo context.\nThe user selects channels, then sends the asset pack to a local SLM, API model, or free chatbot.",
  );
  const [projectName, setProjectName] = useState("SignalFlow");
  const [audience, setAudience] = useState("builders, founders, and technical creators");
  const [generator, setGenerator] = useState("chatbot");
  const [selectedChannels, setSelectedChannels] = useState(["linkedin", "x", "newsletter"]);
  const [outDir, setOutDir] = useState("pipeline-output");
  const [backendStatus, setBackendStatus] = useState("Checking");
  const [statusTone, setStatusTone] = useState("checking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(sampleResult);
  const [activeChannel, setActiveChannel] = useState("linkedin");
  const [copiedLabel, setCopiedLabel] = useState("");

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const resultChannels = useMemo(() => {
    const keys = Object.keys(result?.posts || {});
    return CHANNELS.filter(([key]) => keys.includes(key));
  }, [result]);

  async function checkBackendHealth() {
    try {
      const resp = await fetch(`${API_BASE}/health`);
      const data = await resp.json();
      if (resp.ok && data?.status === "ok") {
        setBackendStatus("Online");
        setStatusTone("online");
      } else {
        setBackendStatus(`Offline (${resp.status})`);
        setStatusTone("offline");
      }
    } catch {
      setBackendStatus("Offline");
      setStatusTone("offline");
    }
  }

  function toggleChannel(channel) {
    setSelectedChannels((current) => {
      if (current.includes(channel)) {
        return current.length === 1 ? current : current.filter((item) => item !== channel);
      }
      return [...current, channel];
    });
  }

  async function createContentKit(event) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);
    try {
      const payload =
        sourceMode === "repo"
          ? { repo: repoPath, notes: "" }
          : { repo: "", notes };
      const resp = await fetch(`${API_BASE}/launch_kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          out_dir: outDir,
          project_name: projectName,
          audience,
          channels: selectedChannels,
          generator,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.detail || data?.error || "SignalFlow could not generate content");
      }
      setResult(data);
      setActiveChannel(Object.keys(data?.posts || {})[0] || "linkedin");
    } catch (launchError) {
      setError(launchError.message);
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
      window.setTimeout(() => setCopiedLabel(""), 1600);
    } catch {
      setError("Clipboard access was blocked. Select the text and copy it manually.");
    }
  }

  const currentPost = result?.posts?.[activeChannel] || "";
  const imageSrc = result?.image_base64
    ? `data:image/png;base64,${result.image_base64}`
    : "";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>SignalFlow</p>
          <h1>Unified context engine for technical content.</h1>
          <p>
            Bring briefs, repositories, URLs, PDFs, or research notes into one
            context layer, route it through a model adapter, and generate
            channel-ready content packs.
          </p>
        </div>
        <div className={`${styles.statusPill} ${styles[statusTone]}`}>
          <span />
          Backend {backendStatus}
        </div>
      </header>

      <section className={styles.pipelineMap} aria-label="SignalFlow architecture">
        {[
          ["Input channels", "Briefs · repos · research"],
          ["Unified context", "Normalize and extract signal"],
          ["Model adapter", "Local API · SLM · cloud gateway"],
          ["Content modules", "Text patterns · canvas · simulation"],
          ["Distribution export", "Drafts, prompts, files, official APIs"],
        ].map(([title, body]) => (
          <div key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </section>

      <section className={styles.appGrid}>
        <form className={styles.builder} onSubmit={createContentKit}>
          <div className={styles.step}>
            <span>1</span>
            <div>
              <h2>Choose input channel</h2>
              <p>Start with a raw brief, git repository, or research/PDF notes.</p>
            </div>
          </div>

          <div className={styles.segmented}>
            {INPUT_MODES.map(([key, label]) => (
              <button
                className={sourceMode === key ? styles.activeSegment : ""}
                key={key}
                onClick={() => setSourceMode(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {sourceMode === "repo" ? (
            <label className={styles.field}>
              Repo path
              <input
                value={repoPath}
                onChange={(event) => setRepoPath(event.target.value)}
                placeholder="C:/Users/you/projects/my-product"
                required={sourceMode === "repo"}
              />
            </label>
          ) : (
            <label className={styles.field}>
              {sourceMode === "research" ? "Research URL, PDF notes, or document excerpts" : "Raw tech brief or prompt"}
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={10}
                required={sourceMode !== "repo"}
              />
            </label>
          )}

          <div className={styles.twoCols}>
            <label className={styles.field}>
              Product
              <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
            </label>
            <label className={styles.field}>
              Audience
              <input value={audience} onChange={(event) => setAudience(event.target.value)} />
            </label>
          </div>

          <div className={styles.step}>
            <span>2</span>
            <div>
              <h2>Select channels</h2>
              <p>These are output formats. Publishing stays manual or official-API based.</p>
            </div>
          </div>

          <div className={styles.channelGrid}>
            {CHANNELS.map(([key, label]) => (
              <button
                className={selectedChannels.includes(key) ? styles.selectedChannel : ""}
                key={key}
                onClick={() => toggleChannel(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.step}>
            <span>3</span>
            <div>
              <h2>Choose generator</h2>
              <p>Route the unified context through a local API, SLM, cloud gateway, or chatbot prompt.</p>
            </div>
          </div>

          <div className={styles.generatorRow}>
            {["local", "api", "slm", "chatbot"].map((item) => (
              <button
                className={generator === item ? styles.activeSegment : ""}
                key={item}
                onClick={() => setGenerator(item)}
                type="button"
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <label className={styles.field}>
            Export folder
            <input value={outDir} onChange={(event) => setOutDir(event.target.value)} />
          </label>

          <button className={styles.primaryButton} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate content"}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </form>

        <section className={styles.results}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>Generated</p>
              <h2>{result.project_name}</h2>
            </div>
            <button
              className={styles.secondaryButton}
              onClick={() => copyText("prompt", result.chatbot_prompt || "")}
              type="button"
            >
              {copiedLabel === "prompt" ? "Copied" : "Copy model prompt"}
            </button>
          </div>

          <div className={styles.summaryBar}>
            <div>
              <strong>{result?.highlights?.length || 0}</strong>
              <span>signals</span>
            </div>
            <div>
              <strong>{resultChannels.length}</strong>
              <span>channels</span>
            </div>
            <div>
              <strong>{result.generator || "local"}</strong>
              <span>generator</span>
            </div>
          </div>

          <div className={styles.tabs}>
            {resultChannels.map(([key, label]) => (
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

          <div className={styles.outputCard}>
            <div className={styles.outputTitle}>
              <h3>{CHANNELS.find(([key]) => key === activeChannel)?.[1] || "Draft"}</h3>
              <button
                className={styles.secondaryButton}
                onClick={() => copyText("draft", currentPost)}
                type="button"
              >
                {copiedLabel === "draft" ? "Copied" : "Copy draft"}
              </button>
            </div>
            <pre>{currentPost}</pre>
          </div>

          <div className={styles.outputGrid}>
            <div className={styles.outputCard}>
              <div className={styles.outputTitle}>
                <h3>Model prompt</h3>
                <button
                  className={styles.secondaryButton}
                  onClick={() => copyText("prompt2", result.chatbot_prompt || "")}
                  type="button"
                >
                  {copiedLabel === "prompt2" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre>{result.chatbot_prompt}</pre>
            </div>

            <div className={styles.outputCard}>
              <div className={styles.outputTitle}>
                <h3>Signal card</h3>
                <span>{result?.assets?.code_image || "PNG asset"}</span>
              </div>
              {imageSrc ? (
                <img className={styles.signalImage} src={imageSrc} alt="Generated signal card" />
              ) : (
                <div className={styles.emptyImage}>Generate to preview the card.</div>
              )}
            </div>
          </div>

          <div className={styles.assetList}>
            {(result?.highlights || []).map((asset) => (
              <div key={asset.path}>
                <strong>{asset.path}</strong>
                <span>{asset.summary}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
