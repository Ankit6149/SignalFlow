"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";

const sampleResult = {
  project_name: "SignalFlow",
  output_dir: "pipeline-output/signalflow-demo",
  highlights: [
    {
      path: "signalflow/launchkit.py",
      score: 4.2,
      summary:
        "High-signal source selected from `signalflow/launchkit.py`; creates post drafts, slide outlines, and a local export folder.",
    },
    {
      path: "frontend/app/page.js",
      score: 3.8,
      summary:
        "High-signal UI file that guides the user from repository path to finished launch kit.",
    },
  ],
  posts: {
    github_release:
      "## SignalFlow update\n\n- Highlight: `signalflow/launchkit.py`\n- Why it matters: Creates a local-first launch kit from repository source.\n\nTry it locally and open an issue with the next workflow you want supported.",
    linkedin:
      "I shipped a new SignalFlow workflow that turns repository work into a local launch kit.\n\nIt helps maintainers explain technical progress without uploading private source.",
    x:
      "Building SignalFlow: local repo in, launch kit out.\n\nUseful for maintainers who want sharper release notes, posts, and code visuals.",
    blog_intro:
      "SignalFlow is becoming a local-first launch kit generator for technical projects. It creates reusable copy, a slide outline, and visual assets that can be edited before publishing.",
  },
  slide_outline:
    "# SignalFlow Launch Kit\n\n## Problem\n- Developers ship meaningful work, but turning it into public updates takes extra time.\n\n## What Changed\n- Local repository scanning\n- Post drafts\n- Code image export\n\n## Next Step\n- Review, edit, and publish through official platform workflows.",
  markdown:
    "# SignalFlow Launch Kit\n\n## Code Highlights\n\n- `signalflow/launchkit.py` - create local launch assets\n\n## Post Drafts\n\nReady to edit before publishing.",
  assets: {
    code_image: "pipeline-output/signalflow-demo/code-highlight.png",
    markdown: "pipeline-output/signalflow-demo/launch-kit.md",
    summary: "pipeline-output/signalflow-demo/launch-kit.json",
  },
  integration_notes: [
    "Copy the GitHub release draft into a GitHub Release or PR description.",
    "Use the LinkedIn and X drafts as editable starting points.",
    "Keep publishing manual until OAuth integrations are configured by the user.",
  ],
};

export default function Home() {
  const [repoPath, setRepoPath] = useState("");
  const [projectName, setProjectName] = useState("SignalFlow");
  const [audience, setAudience] = useState(
    "open-source maintainers and developers sharing technical progress",
  );
  const [outDir, setOutDir] = useState("pipeline-output");
  const [top, setTop] = useState(5);
  const [backendStatus, setBackendStatus] = useState("Checking");
  const [statusTone, setStatusTone] = useState("checking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(sampleResult);
  const [activeChannel, setActiveChannel] = useState("github_release");
  const [copiedLabel, setCopiedLabel] = useState("");

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const channels = useMemo(
    () => [
      ["github_release", "GitHub"],
      ["linkedin", "LinkedIn"],
      ["x", "X"],
      ["blog_intro", "Blog"],
    ],
    [],
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

  async function createLaunchKit(event) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);
    try {
      const resp = await fetch(`${API_BASE}/launch_kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoPath,
          out_dir: outDir,
          project_name: projectName,
          audience,
          top: Number(top),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.detail || data?.error || "Launch kit failed");
      }
      setResult(data);
      setActiveChannel("github_release");
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
    <main className={styles.shell}>
      <section className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <p className={styles.eyebrow}>SignalFlow</p>
            <h1>Local launch kits for technical work</h1>
            <p>
              Turn a repository into editable release copy, social drafts, slide
              notes, and a code visual without uploading source.
            </p>
          </div>

          <div className={`${styles.statusCard} ${styles[statusTone]}`}>
            <span className={styles.statusDot} />
            <div>
              <strong>Backend {backendStatus}</strong>
              <small>Python API at localhost:8000</small>
            </div>
            <button type="button" onClick={checkBackendHealth}>
              Check
            </button>
          </div>

          <form className={styles.form} onSubmit={createLaunchKit}>
            <label>
              Repository path
              <input
                value={repoPath}
                onChange={(event) => setRepoPath(event.target.value)}
                placeholder="C:\Users\you\projects\my-repo"
                required
              />
            </label>

            <label>
              Project name
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="My Open Source Project"
              />
            </label>

            <label>
              Audience
              <textarea
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                rows={3}
              />
            </label>

            <div className={styles.formGrid}>
              <label>
                Output folder
                <input
                  value={outDir}
                  onChange={(event) => setOutDir(event.target.value)}
                />
              </label>
              <label>
                Highlights
                <input
                  min="1"
                  max="10"
                  type="number"
                  value={top}
                  onChange={(event) => setTop(event.target.value)}
                />
              </label>
            </div>

            <button className={styles.primaryButton} disabled={isGenerating}>
              {isGenerating ? "Creating kit..." : "Create launch kit"}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </aside>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <p className={styles.eyebrow}>Launch Kit</p>
              <h2>{result?.project_name || "Ready when you are"}</h2>
            </div>
            <div className={styles.outputPath}>
              <span>Export</span>
              <strong>{result?.output_dir || "Not generated yet"}</strong>
            </div>
          </div>

          <div className={styles.metrics}>
            <div>
              <strong>{result?.highlights?.length || 0}</strong>
              <span>highlights</span>
            </div>
            <div>
              <strong>{Object.keys(result?.posts || {}).length}</strong>
              <span>drafts</span>
            </div>
            <div>
              <strong>Local</strong>
              <span>source stays on device</span>
            </div>
          </div>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <h3>Code Highlights</h3>
              <span>Ranked by source signal</span>
            </div>
            <div className={styles.highlightList}>
              {(result?.highlights || []).map((item) => (
                <article className={styles.highlightCard} key={item.path}>
                  <div>
                    <strong>{item.path}</strong>
                    <p>{item.summary}</p>
                  </div>
                  <span>{Number(item.score || 0).toFixed(2)}</span>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.splitPanel}>
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>
                <h3>Channel Drafts</h3>
                <button
                  className={styles.secondaryButton}
                  onClick={() => copyText("draft", currentPost)}
                  type="button"
                >
                  {copiedLabel === "draft" ? "Copied" : "Copy draft"}
                </button>
              </div>
              <div className={styles.tabs}>
                {channels.map(([key, label]) => (
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
              <pre className={styles.copyBox}>{currentPost}</pre>
            </div>

            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>
                <h3>Code Visual</h3>
                <span>{result?.assets?.code_image || "Generated PNG preview"}</span>
              </div>
              {imageSrc ? (
                <img className={styles.codeImage} src={imageSrc} alt="Generated code highlight" />
              ) : (
                <div className={styles.imagePlaceholder}>Run the launch kit to preview the PNG.</div>
              )}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <h3>Slide Outline</h3>
              <button
                className={styles.secondaryButton}
                onClick={() => copyText("slides", result?.slide_outline || "")}
                type="button"
              >
                {copiedLabel === "slides" ? "Copied" : "Copy outline"}
              </button>
            </div>
            <pre className={styles.copyBox}>{result?.slide_outline || ""}</pre>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <h3>Markdown Export</h3>
              <button
                className={styles.secondaryButton}
                onClick={() => copyText("markdown", result?.markdown || "")}
                type="button"
              >
                {copiedLabel === "markdown" ? "Copied" : "Copy Markdown"}
              </button>
            </div>
            <pre className={`${styles.copyBox} ${styles.markdownBox}`}>{result?.markdown || ""}</pre>
          </section>

          <section className={styles.integrationStrip}>
            {(result?.integration_notes || []).map((note) => (
              <div key={note}>{note}</div>
            ))}
          </section>
        </section>
      </section>
    </main>
  );
}
