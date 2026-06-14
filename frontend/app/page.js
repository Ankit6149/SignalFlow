"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";

const sampleResult = {
  project_name: "SignalFlow",
  output_dir: "pipeline-output/signalflow-demo",
  highlights: [
    {
      path: "pasted-notes",
      score: 1,
      summary:
        "Launch context supplied from notes; starts with: Added local-first content generation for builders.",
    },
  ],
  posts: {
    linkedin:
      "I am building SignalFlow, a local-first way to turn technical work into publish-ready content.\n\nIt takes code, notes, changelogs, or repo context and creates drafts for LinkedIn, X, newsletters, blogs, and release notes.",
    x:
      "Building SignalFlow: turn technical work into posts, release notes, newsletters, and launch assets.\n\nLocal-first. Builder-focused. No auto-posting surprises.",
    blog_intro:
      "SignalFlow helps builders find the signal in their work and share it across channels without starting from a blank page.",
    newsletter:
      "Subject: SignalFlow update\n\nI am working on SignalFlow, a local-first content engine for technical builders. It turns raw project context into channel-ready drafts and launch assets.",
    github_release:
      "## SignalFlow update\n\nSignalFlow now creates editable launch assets from technical context while keeping source local.",
  },
  slide_outline:
    "# SignalFlow\n\n## Signal\n- Builders ship work but struggle to explain it consistently.\n\n## Flow\n- Add repo context or notes.\n- Generate channel drafts.\n- Review, copy, publish manually.\n\n## Outcome\n- More consistent visibility without uploading private source.",
  markdown:
    "# SignalFlow Kit\n\n## Channel Drafts\n\nReady-to-edit drafts for LinkedIn, X, newsletters, blogs, and GitHub.",
  assets: {
    code_image: "pipeline-output/signalflow-demo/signal-card.png",
    markdown: "pipeline-output/signalflow-demo/signalflow-kit.md",
    summary: "pipeline-output/signalflow-demo/signalflow-kit.json",
  },
  integration_notes: [
    "Copy drafts into LinkedIn, X, newsletters, blogs, GitHub releases, or docs.",
    "Keep publishing manual until OAuth integrations are configured by the user.",
    "Use the Markdown export as the source of truth for launch review.",
  ],
};

export default function Home() {
  const [sourceMode, setSourceMode] = useState("notes");
  const [repoPath, setRepoPath] = useState("");
  const [notes, setNotes] = useState(
    "Shipped a local-first content workflow for builders.\nIt turns code, changelogs, repo context, or notes into LinkedIn, X, blog, newsletter, and release drafts.\nThe product keeps publishing manual and source local.",
  );
  const [projectName, setProjectName] = useState("SignalFlow");
  const [audience, setAudience] = useState(
    "builders, indie hackers, open-source maintainers, and technical founders",
  );
  const [outDir, setOutDir] = useState("pipeline-output");
  const [top, setTop] = useState(5);
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

  const channels = useMemo(
    () => [
      ["linkedin", "LinkedIn"],
      ["x", "X"],
      ["blog_intro", "Blog"],
      ["newsletter", "Newsletter"],
      ["github_release", "GitHub"],
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
          top: Number(top),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.detail || data?.error || "SignalFlow could not create the kit");
      }
      setResult(data);
      setActiveChannel(data?.posts?.linkedin ? "linkedin" : Object.keys(data?.posts || {})[0]);
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
  const backendOnline = statusTone === "online";

  return (
    <main className={styles.shell}>
      <section className={styles.heroBand}>
        <nav className={styles.nav}>
          <strong>SignalFlow</strong>
          <span>Local-first publishing engine</span>
        </nav>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Find the signal. Share it everywhere.</p>
            <h1>Turn your work into posts, release notes, and launch assets.</h1>
            <p>
              SignalFlow creates channel-ready drafts from repo context, code,
              changelogs, or rough notes while keeping publishing manual and
              source local.
            </p>
            <div className={styles.heroActions}>
              <a href="#workspace">Create a kit</a>
              <button type="button" onClick={() => copyText("cli", "python -m signalflow.cli launch-kit --repo .")}>
                {copiedLabel === "cli" ? "Copied" : "Copy CLI"}
              </button>
            </div>
          </div>
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <span>Channels</span>
              <strong>LinkedIn · X · Blog · Newsletter · GitHub</strong>
            </div>
            <pre>{sampleResult.posts.linkedin}</pre>
          </div>
        </div>
      </section>

      <section className={styles.workspace} id="workspace">
        <aside className={styles.controlPanel}>
          <div className={`${styles.statusCard} ${styles[statusTone]}`}>
            <span className={styles.statusDot} />
            <div>
              <strong>Backend {backendStatus}</strong>
              <small>{backendOnline ? "Ready to generate" : "Run python -m signalflow.cli serve --host 127.0.0.1 --port 8000"}</small>
            </div>
            <button type="button" onClick={checkBackendHealth}>
              Check
            </button>
          </div>

          <form className={styles.form} onSubmit={createLaunchKit}>
            <div className={styles.modeSwitch}>
              <button
                className={sourceMode === "notes" ? styles.activeMode : ""}
                onClick={() => setSourceMode("notes")}
                type="button"
              >
                Notes
              </button>
              <button
                className={sourceMode === "repo" ? styles.activeMode : ""}
                onClick={() => setSourceMode("repo")}
                type="button"
              >
                Repo
              </button>
            </div>

            {sourceMode === "repo" ? (
              <label>
                Repository path
                <input
                  value={repoPath}
                  onChange={(event) => setRepoPath(event.target.value)}
                  placeholder="C:/Users/you/projects/my-repo"
                  required={sourceMode === "repo"}
                />
              </label>
            ) : (
              <label>
                Notes, code, changelog, or launch context
                <textarea
                  className={styles.notesArea}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={9}
                  required={sourceMode === "notes"}
                />
              </label>
            )}

            <label>
              Product or project name
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="SignalFlow"
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
                Signals
                <input
                  min="1"
                  max="10"
                  type="number"
                  value={top}
                  onChange={(event) => setTop(event.target.value)}
                  disabled={sourceMode === "notes"}
                />
              </label>
            </div>

            <button className={styles.primaryButton} disabled={isGenerating}>
              {isGenerating ? "Creating SignalFlow kit..." : "Generate drafts"}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </aside>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <p className={styles.eyebrow}>Generated kit</p>
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
              <span>signals</span>
            </div>
            <div>
              <strong>{Object.keys(result?.posts || {}).length}</strong>
              <span>channels</span>
            </div>
            <div>
              <strong>Manual</strong>
              <span>review before publish</span>
            </div>
          </div>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <h3>Signals</h3>
              <span>What the drafts are based on</span>
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
                <h3>Signal Card</h3>
                <span>{result?.assets?.code_image || "Generated PNG preview"}</span>
              </div>
              {imageSrc ? (
                <img className={styles.codeImage} src={imageSrc} alt="Generated SignalFlow card" />
              ) : (
                <div className={styles.imagePlaceholder}>Generate a kit to preview the PNG.</div>
              )}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>
              <h3>Launch Outline</h3>
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
