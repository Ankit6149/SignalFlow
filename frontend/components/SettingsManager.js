import React, { useState } from "react";
import { MODEL_ROUTES_META } from "../lib/config";

export default function SettingsManager({
  aiSettings,
  onSaveSettings,
  onTestConnection,
  isTesting,
  testResult,
  clearTestData,
  onImportData,
  onExportData,
  onClearAllData
}) {
  const [activeSubTab, setActiveSubTab] = useState("ai");

  // Local settings clone
  const [provider, setProvider] = useState(aiSettings.defaultProvider || "template");
  const [settings, setSettings] = useState(aiSettings);
  
  // Recording settings states
  const [recordQuality, setRecordQuality] = useState("1080p");
  const [showTips, setShowTips] = useState(true);

  // Advanced states
  const [devMode, setDevMode] = useState(false);

  function handleProviderConfigChange(prov, field, val) {
    setSettings(prev => ({
      ...prev,
      [prov]: {
        ...prev[prov],
        [field]: val
      }
    }));
  }

  function handleSave() {
    const updated = {
      ...settings,
      defaultProvider: provider
    };
    onSaveSettings(updated);
    alert("Settings saved successfully.");
  }

  function handleTest() {
    onTestConnection(provider, settings[provider] || {});
  }

  const currentMeta = MODEL_ROUTES_META.find(m => m.key === provider);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>System Settings</h2>
          <p style={styles.subtitle}>Configure AI provider credentials, recording preferences, and developer debug flags.</p>
        </div>
        <button onClick={handleSave} style={styles.saveBtn}>Save All Settings</button>
      </header>

      <div style={styles.body}>
        {/* Sub Tabs */}
        <div style={styles.subTabs}>
          <button
            onClick={() => setActiveSubTab("ai")}
            style={{ ...styles.subTabBtn, ...(activeSubTab === "ai" ? styles.subTabBtnActive : {}) }}
          >
            🤖 AI Model Provider
          </button>
          <button
            onClick={() => setActiveSubTab("recording")}
            style={{ ...styles.subTabBtn, ...(activeSubTab === "recording" ? styles.subTabBtnActive : {}) }}
          >
            🎥 Recording Preferences
          </button>
          <button
            onClick={() => setActiveSubTab("advanced")}
            style={{ ...styles.subTabBtn, ...(activeSubTab === "advanced" ? styles.subTabBtnActive : {}) }}
          >
            ⚙️ Advanced / Data Admin
          </button>
        </div>

        {/* Content Panels */}
        <div style={styles.panel}>
          {/* AI SETTINGS */}
          {activeSubTab === "ai" && (
            <div style={styles.form}>
              <div style={styles.formCol}>
                <label style={styles.label}>Default AI Generation Route</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    clearTestData();
                  }}
                  style={styles.select}
                >
                  {MODEL_ROUTES_META.map(m => (
                    <option key={m.key} value={m.key}>
                      {m.title} ({m.badge} - {m.price})
                    </option>
                  ))}
                </select>
                {currentMeta && <p style={styles.metaDesc}>{currentMeta.desc} {currentMeta.use}</p>}
              </div>

              {/* Warnings for cloud keys */}
              {!currentMeta?.isLocal && (
                <div style={styles.warningBox}>
                  ⚠️ <strong>Security Alert:</strong> Local storage is used for offline convenience. Avoid saving production/org admin keys in public sandboxes. If you run on shared screens, toggle the input visibility or type temporarily in the wizard details tab.
                </div>
              )}

              {/* Provider credentials inputs */}
              {provider !== "prompt" && provider !== "template" && (
                <div style={styles.credentialsForm}>
                  <h4 style={styles.credentialsTitle}>{currentMeta?.title} Configurations</h4>
                  
                  {currentMeta?.supportsTemporaryKey && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Personal API Key *</label>
                      <input
                        type="password"
                        value={settings[provider]?.apiKey || ""}
                        onChange={(e) => handleProviderConfigChange(provider, "apiKey", e.target.value)}
                        style={styles.input}
                        placeholder={`Paste your ${currentMeta?.title} key`}
                      />
                    </div>
                  )}

                  {provider === "custom" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Base Gateway Endpoint URL</label>
                      <input
                        type="url"
                        value={settings.custom?.baseUrl || ""}
                        onChange={(e) => handleProviderConfigChange("custom", "baseUrl", e.target.value)}
                        style={styles.input}
                        placeholder="https://mygateway.com/v1"
                      />
                    </div>
                  )}

                  {provider === "ollama" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>Ollama local URL</label>
                      <input
                        type="url"
                        value={settings.ollama?.baseUrl || "http://localhost:11434"}
                        onChange={(e) => handleProviderConfigChange("ollama", "baseUrl", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  )}

                  {provider === "lmstudio" && (
                    <div style={styles.formCol}>
                      <label style={styles.label}>LM Studio local URL</label>
                      <input
                        type="url"
                        value={settings.lmstudio?.baseUrl || "http://localhost:1234"}
                        onChange={(e) => handleProviderConfigChange("lmstudio", "baseUrl", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  )}

                  <div style={styles.formCol}>
                    <label style={styles.label}>Override Model Name (Optional)</label>
                    <input
                      type="text"
                      value={settings[provider]?.model || ""}
                      onChange={(e) => handleProviderConfigChange(provider, "model", e.target.value)}
                      style={styles.input}
                      placeholder={`e.g. ${currentMeta?.defaultModel}`}
                    />
                  </div>

                  {currentMeta?.canTest && (
                    <div style={styles.testConnectionRow}>
                      <button
                        type="button"
                        onClick={handleTest}
                        disabled={isTesting}
                        style={styles.testBtn}
                      >
                        {isTesting ? "Testing..." : "Test Connection Connection"}
                      </button>

                      {testResult && (
                        <div style={styles.testResultIndicator}>
                          {testResult.ok ? (
                            <span style={{ color: "#10b981", fontWeight: "700" }}>✓ Connected successfully!</span>
                          ) : (
                            <div style={{ color: "#f43f5e" }}>
                              <span>✕ Failed: {testResult.error}</span>
                              {testResult.setupHint && <p style={styles.hint}>{testResult.setupHint}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RECORDING SETTINGS */}
          {activeSubTab === "recording" && (
            <div style={styles.form}>
              <div style={styles.formCol}>
                <label style={styles.label}>Walkthrough Capture Quality (FPS Heuristics)</label>
                <select
                  value={recordQuality}
                  onChange={(e) => setRecordQuality(e.target.value)}
                  style={styles.select}
                >
                  <option value="1080p">High Definition (1080p / 30fps)</option>
                  <option value="720p">Standard (720p / 30fps)</option>
                  <option value="480p">Mobile Compact (480p / 24fps)</option>
                </select>
              </div>

              <div style={styles.formCol}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showTips}
                    onChange={(e) => setShowTips(e.target.checked)}
                  />
                  Show recording guidelines/tips widget during walkthrough
                </label>
              </div>

              {showTips && (
                <div style={styles.tipsWidget}>
                  <h4 style={styles.tipsTitle}>💡 Screencast Walkthrough Tips</h4>
                  <ul style={styles.tipsList}>
                    <li>Select <strong>"Share this Tab"</strong> for clean resolution frames without desktop panels.</li>
                    <li>Toggle the microphone option to describe features live.</li>
                    <li>Move the mouse slowly to keep compression rate layouts crisp.</li>
                    <li>Click <strong>"Take Screenshot Frame"</strong> during active recordings to save thumbnail plans.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ADVANCED ADMIN */}
          {activeSubTab === "advanced" && (
            <div style={styles.form}>
              <div style={styles.formCol}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={devMode}
                    onChange={(e) => setDevMode(e.target.checked)}
                  />
                  Enable Developer Mode & Diagnostic log outputs
                </label>
              </div>

              <div style={styles.adminDataSection}>
                <h4 style={styles.credentialsTitle}>Data Management</h4>
                <p style={styles.metaDesc}>Export or clear your browser's offline database configuration packages.</p>

                <div style={styles.btnRow}>
                  <button onClick={onExportData} style={styles.exportBtn}>Export JSON Backup</button>
                  <button
                    onClick={() => {
                      const file = document.createElement("input");
                      file.type = "file";
                      file.accept = ".json";
                      file.onchange = (e) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          try {
                            const parsed = JSON.parse(evt.target.result);
                            onImportData(parsed);
                            alert("Imported successfully.");
                          } catch (err) {
                            alert("Invalid JSON package backup.");
                          }
                        };
                        reader.readAsText(e.target.files[0]);
                      };
                      file.click();
                    }}
                    style={styles.importBtn}
                  >
                    Import JSON Backup
                  </button>
                  <button onClick={onClearAllData} style={styles.clearBtn}>Clear Local Database</button>
                </div>
              </div>
            </div>
          )}
        </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0
  },
  subtitle: {
    fontSize: "14px",
    color: "#94a3b8",
    margin: "4px 0 0 0"
  },
  saveBtn: {
    background: "#6366f1",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  body: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "32px",
    alignItems: "start"
  },
  subTabs: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  subTabBtn: {
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  subTabBtnActive: {
    background: "rgba(99, 102, 241, 0.15)",
    color: "#818cf8"
  },
  panel: {
    background: "#151b23",
    border: "1px solid #212c3d",
    borderRadius: "16px",
    padding: "32px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "12px",
    fontWeight: "7500",
    color: "#cbd5e1"
  },
  select: {
    background: "#0b0f14",
    border: "1px solid #212c3d",
    color: "#f1f5f9",
    padding: "10px 16px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    cursor: "pointer"
  },
  metaDesc: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.4"
  },
  warningBox: {
    background: "rgba(245, 158, 11, 0.08)",
    border: "1px solid rgba(245, 158, 11, 0.15)",
    borderRadius: "8px",
    padding: "14px",
    color: "#fbbf24",
    fontSize: "13px",
    lineHeight: "1.5"
  },
  credentialsForm: {
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    paddingTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  credentialsTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: 0
  },
  input: {
    background: "#0b0f14",
    border: "1px solid #212c3d",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f8fafc",
    outline: "none",
    fontSize: "14px"
  },
  testConnectionRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "8px"
  },
  testBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  testResultIndicator: {
    fontSize: "13px"
  },
  hint: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: "4px 0 0 0"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#cbd5e1",
    cursor: "pointer"
  },
  tipsWidget: {
    background: "rgba(99, 102, 241, 0.05)",
    border: "1px solid rgba(99, 102, 241, 0.1)",
    borderRadius: "12px",
    padding: "20px"
  },
  tipsTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#818cf8",
    margin: "0 0 10px 0"
  },
  tipsList: {
    margin: 0,
    paddingLeft: "16px",
    fontSize: "12px",
    color: "#94a3b8",
    lineHeight: "1.6",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  adminDataSection: {
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    paddingTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  btnRow: {
    display: "flex",
    gap: "12px"
  },
  exportBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  importBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  },
  clearBtn: {
    background: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    color: "#f43f5e",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
  }
};
