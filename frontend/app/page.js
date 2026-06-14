"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const API_BASE = "/api";

export default function Home() {
  const [code, setCode] = useState('print("Hello World")');
  const [description, setDescription] = useState(
    "A simple example code snippet.",
  );
  const [generatedText, setGeneratedText] = useState("");
  const [presentation, setPresentation] = useState("");
  const [imageData, setImageData] = useState("");
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [repoPath, setRepoPath] = useState("C:/path/to/repo");
  const [outDir, setOutDir] = useState("pipeline-output");
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      const resp = await fetch(`${API_BASE}/health`);
      const data = await resp.json();
      setBackendStatus(
        resp.ok && data?.status === "ok"
          ? "Online"
          : `Offline (${resp.status})`,
      );
    } catch (error) {
      setBackendStatus("Offline");
    }
  }

  async function fetchJson(endpoint, payload) {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || `Request failed: ${resp.status}`);
    }
    return resp.json();
  }

  async function generatePost() {
    setGeneratedText("Generating...");
    try {
      const data = await fetchJson("/generate_post", {
        context: description,
        payload: { CoreTokens: code },
        target: "devrel",
      });
      setGeneratedText(data.text || "No text returned");
    } catch (error) {
      setGeneratedText(`Error: ${error.message}`);
    }
  }

  async function renderCode() {
    setImageData("");
    const resp = await fetch(`${API_BASE}/render_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, lexer: "python" }),
    });
    const data = await resp.json();
    setImageData(`data:image/png;base64,${data.image_base64}`);
  }

  async function generatePresentation() {
    setPresentation("Generating presentation...");
    try {
      const data = await fetchJson("/generate_presentation", {
        context: description,
        payload: { CoreTokens: code },
        target: "presentation",
      });
      setPresentation(data.markdown || "No markdown returned");
    } catch (error) {
      setPresentation(`Error: ${error.message}`);
    }
  }

  async function runPipeline() {
    setPipelineStatus("Running pipeline...");
    try {
      const data = await fetchJson("/run_pipeline", {
        repo: repoPath,
        out_dir: outDir,
        top: 3,
      });
      setPipelineStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setPipelineStatus(`Pipeline failed: ${error.message}`);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SignalFlow</p>
          <h1>Developer visibility made simple</h1>
          <p>
            Generate posts, code snapshots, presentations, and pipeline
            summaries from your local repo.
          </p>
        </div>
        <div className={styles.statusPill}>Backend: {backendStatus}</div>
      </header>

      <section className={styles.panel}>
        <h2>1. Enter your code</h2>
        <label className={styles.fieldLabel}>
          Code snippet
          <textarea
            className={styles.fieldTextarea}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <label className={styles.fieldLabel}>
          Short description
          <input
            className={styles.fieldInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </section>

      <section className={`${styles.panel} ${styles.gridTwo}`}>
        <div>
          <h2>Generate social copy</h2>
          <button className={styles.primaryButton} onClick={generatePost}>
            Generate Post
          </button>
          <pre className={styles.output}>{generatedText}</pre>
        </div>

        <div>
          <h2>Render code snapshot</h2>
          <button className={styles.primaryButton} onClick={renderCode}>
            Render Code Image
          </button>
          {imageData && (
            <img
              src={imageData}
              alt="Code snapshot"
              className={styles.codeImage}
            />
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Generate a slide outline</h2>
        <button className={styles.primaryButton} onClick={generatePresentation}>
          Create Presentation
        </button>
        <pre className={styles.output}>{presentation}</pre>
      </section>

      <section className={styles.panel}>
        <h2>Run the local pipeline</h2>
        <div className={styles.row}>
          <label className={styles.fieldLabel}>
            Repo path
            <input
              className={styles.fieldInput}
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
          </label>
          <label className={styles.fieldLabel}>
            Output dir
            <input
              className={styles.fieldInput}
              value={outDir}
              onChange={(e) => setOutDir(e.target.value)}
            />
          </label>
        </div>
        <button className={styles.primaryButton} onClick={runPipeline}>
          Run Pipeline
        </button>
        <pre className={`${styles.output} ${styles.pipelineOutput}`}>
          {pipelineStatus}
        </pre>
      </section>
    </main>
  );
}
