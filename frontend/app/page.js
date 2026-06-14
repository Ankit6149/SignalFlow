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
  ["brief", "Brief"],
  ["repo", "Repository"],
  ["research", "Research"],
];

const GENERATORS = [
  ["chatbot", "Chatbot"],
  ["local", "Local API"],
  ["slm", "Embedded SLM"],
  ["api", "Cloud API"],
];

const DISTRIBUTION_MODES = [
  ["manual", "Manual review"],
  ["files", "Files only"],
  ["webhook", "Webhook"],
  ["official_api", "Official API"],
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
  integration_config: {
    model_route: "chatbot",
    model_endpoint: "",
    model_name: "copy-paste prompt",
    api_key_present: false,
    distribution_mode: "manual",
    webhook_configured: false,
  },
};

export default function Home() {
  const [sourceMode, setSourceMode] = useState("brief");
  const [repoPath, setRepoPath] = useState("");
  const [researchUrl, setResearchUrl] = useState("");
  const [documentPath, setDocumentPath] = useState("");
  const [notes, setNotes] = useState(
    "SignalFlow helps builders turn product work into content.\nAssets can be launch notes, code snippets, changelogs, screenshots, or repo context.\nThe user selects channels, then sends the asset pack to a local SLM, API model, or free chatbot.",
  );
  const [projectName, setProjectName] = useState("SignalFlow");
  const [audience, setAudience] = useState("builders, founders, and technical creators");
  const [generator, setGenerator] = useState("chatbot");
  const [modelEndpoint, setModelEndpoint] = useState("http://127.0.0.1:8000");
  const [modelName, setModelName] = useState("copy-paste prompt");
  const [apiKey, setApiKey] = useState("");
  const [selectedChannels, setSelectedChannels] = useState(["linkedin", "x", "newsletter"]);
  const [distributionMode, setDistributionMode] = useState("manual");
  const [webhookUrl, setWebhookUrl] = useState("");
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

  const integrationConfig = useMemo(
    () => ({
      ...(result?.integration_config || {}),
      model_route: generator,
      model_endpoint: modelEndpoint,
      model_name: modelName,
      api_key_present: apiKey.trim().length > 0,
      distribution_mode: distributionMode,
      webhook_configured: webhookUrl.trim().length > 0,
    }),
    [apiKey, distributionMode, generator, modelEndpoint, modelName, result, webhookUrl],
  );

  const copyableConfig = useMemo(
    () =>
      JSON.stringify(
        {
          product: projectName,
          input_channel: sourceMode,
          model: {
            route: generator,
            endpoint: modelEndpoint,
            name: modelName,
            api_key: apiKey ? "<set in your local vault or env>" : "",
          },
          output_channels: selectedChannels,
          distribution: {
            mode: distributionMode,
            webhook_url: webhookUrl,
            export_folder: outDir,
          },
        },
        null,
        2,
      ),
    [
      apiKey,
      distributionMode,
      generator,
      modelEndpoint,
      modelName,
      outDir,
      projectName,
      selectedChannels,
      sourceMode,
      webhookUrl,
    ],
  );

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

  function buildInputPayload() {
    if (sourceMode === "repo") {
      return { input_type: "repo", repo: repoPath, notes: "" };
    }
    if (sourceMode === "research") {
      return {
        input_type: "research",
        repo: "",
        notes: "",
        research_url: researchUrl,
        document_text: notes,
        document_path: documentPath,
      };
    }
    return { input_type: "brief", repo: "", notes };
  }

  async function createContentKit(event) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);
    try {
      const resp = await fetch(`${API_BASE}/launch_kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildInputPayload(),
          out_dir: outDir,
          project_name: projectName,
          audience,
          channels: selectedChannels,
          generator,
          model_endpoint: modelEndpoint,
          model_name: modelName,
          api_key_present: apiKey.trim().length > 0,
          distribution_mode: distributionMode,
          webhook_url: webhookUrl,
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
          <h1>Turn technical context into channel-ready content.</h1>
          <p>
            Connect a brief, repository, URL, or document notes, choose a model route,
            generate drafts, and export a reviewed content kit from one workspace.
          </p>
        </div>
        <div className={`${styles.statusPill} ${styles[statusTone]}`}>
          <span />
          Backend {backendStatus}
        </div>
      </header>

      <section className={styles.pipelineMap} aria-label="SignalFlow architecture">
        {[
          ["Inputs", "Briefs, repos, research"],
          ["Context", "Signal extraction"],
          ["Model", "Local, SLM, API, chatbot"],
          ["Drafts", "Social and long-form"],
          ["Export", "Files, webhook, official APIs"],
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
              <h2>Input</h2>
              <p>Add the source context SignalFlow should understand.</p>
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
              Repository path
              <input
                value={repoPath}
                onChange={(event) => setRepoPath(event.target.value)}
                placeholder="C:/Users/you/projects/my-product"
                required={sourceMode === "repo"}
              />
            </label>
          ) : sourceMode === "research" ? (
            <div className={styles.integrationBox}>
              <label className={styles.field}>
                Research URL
                <input
                  value={researchUrl}
                  onChange={(event) => setResearchUrl(event.target.value)}
                  placeholder="https://example.com/research"
                />
              </label>
              <label className={styles.field}>
                Document path
                <input
                  value={documentPath}
                  onChange={(event) => setDocumentPath(event.target.value)}
                  placeholder="C:/Users/you/docs/brief.pdf"
                />
              </label>
              <label className={styles.field}>
                Extracted notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={8}
                />
              </label>
            </div>
          ) : (
            <label className={styles.field}>
              Brief
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={9}
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
              <h2>Model adapter</h2>
              <p>Choose where the unified context should be sent.</p>
            </div>
          </div>

          <div className={styles.generatorRow}>
            {GENERATORS.map(([key, label]) => (
              <button
                className={generator === key ? styles.activeSegment : ""}
                key={key}
                onClick={() => setGenerator(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.integrationBox}>
            <div className={styles.twoCols}>
              <label className={styles.field}>
                Endpoint
                <input
                  value={modelEndpoint}
                  onChange={(event) => setModelEndpoint(event.target.value)}
                  placeholder="http://127.0.0.1:8000"
                />
              </label>
              <label className={styles.field}>
                Model
                <input
                  value={modelName}
                  onChange={(event) => setModelName(event.target.value)}
                  placeholder="llama-3.2 / gpt / custom"
                />
              </label>
            </div>
            <label className={styles.field}>
              API key
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Stored only in this browser field"
              />
            </label>
          </div>

          <div className={styles.step}>
            <span>3</span>
            <div>
              <h2>Outputs</h2>
              <p>Select content channels and the export destination.</p>
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

          <label className={styles.field}>
            Export folder
            <input value={outDir} onChange={(event) => setOutDir(event.target.value)} />
          </label>

          <div className={styles.step}>
            <span>4</span>
            <div>
              <h2>Distribution</h2>
              <p>Keep publishing explicit, reviewable, and platform-safe.</p>
            </div>
          </div>

          <div className={styles.generatorRow}>
            {DISTRIBUTION_MODES.map(([key, label]) => (
              <button
                className={distributionMode === key ? styles.activeSegment : ""}
                key={key}
                onClick={() => setDistributionMode(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.integrationBox}>
            <label className={styles.field}>
              Webhook or official API URL
              <input
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://hooks.example.com/signalflow"
              />
            </label>
            <button
              className={styles.secondaryButton}
              onClick={() => copyText("config", copyableConfig)}
              type="button"
            >
              {copiedLabel === "config" ? "Copied config" : "Copy integration config"}
            </button>
          </div>

          <button className={styles.primaryButton} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate content kit"}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </form>

        <section className={styles.results}>
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.eyebrow}>Generated kit</p>
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
              <span>model route</span>
            </div>
            <div>
              <strong>{integrationConfig.distribution_mode || "manual"}</strong>
              <span>distribution</span>
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

          <div className={styles.outputCard}>
            <div className={styles.outputTitle}>
              <h3>Integration config</h3>
              <button
                className={styles.secondaryButton}
                onClick={() => copyText("resultConfig", JSON.stringify(integrationConfig, null, 2))}
                type="button"
              >
                {copiedLabel === "resultConfig" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>{JSON.stringify(integrationConfig, null, 2)}</pre>
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
