"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import ProjectManager from "../components/ProjectManager";
import ContentPackageCreationFlow from "../components/ContentPackageCreationFlow";
import ContentLibrary from "../components/ContentLibrary";
import ChannelsConnector from "../components/ChannelsConnector";
import SettingsManager from "../components/SettingsManager";
import { storageService } from "../lib/storageService";
import { PRODUCT_NAME, MODEL_ROUTES_META } from "../lib/config";
import LandingPage from "../components/LandingPage";

const API_BASE = "/api";
const ACCESS_TOKEN_STORAGE_KEY = "signalflow_owner_token";

export default function Home() {
  const [view, setView] = useState("dashboard");
  const [creationSource, setCreationSource] = useState("manual");

  // Core Data States
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("default-project");
  const [packages, setPackages] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [connectedChannels, setConnectedChannels] = useState({});
  const [aiSettings, setAiSettings] = useState({});
  const [postingLogs, setPostingLogs] = useState([]);

  // Session & Access States
  const [accessLocked, setAccessLocked] = useState(false);
  const [publicHosted, setPublicHosted] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showLanding, setShowLanding] = useState(false);

  // Detect localhost to bypass landing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocalhost = 
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" || 
        window.location.hostname.startsWith("192.168.");
      if (!isLocalhost) {
        setShowLanding(true);
      }
    }
  }, []);

  // Provider Connection Test States
  const [isTestingSettings, setIsTestingSettings] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Active project helper
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  // AI Route configuration description helper
  const activeAiStatus = useMemo(() => {
    if (!aiSettings.defaultProvider) return "Loading...";
    const route = MODEL_ROUTES_META.find(m => m.key === aiSettings.defaultProvider);
    return route ? route.title : aiSettings.defaultProvider;
  }, [aiSettings]);

  // Load persistence layers
  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "";
    setAccessToken(token);

    checkHealth();
    fetchBackendSocialStatus();

    // Ingest local persistence
    setProjects(storageService.getProjects());
    setActiveProjectId(storageService.getActiveProjectId());
    setPackages(storageService.getPackages());
    setScheduledPosts(storageService.getScheduledPosts());
    setAiSettings(storageService.getAISettings());

    // Load posting logs
    const savedLogs = window.localStorage.getItem("signalflow_posting_logs");
    if (savedLogs) {
      setPostingLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Listen for Chrome Extension Handoffs
  useEffect(() => {
    const handleExtensionIngest = (e) => {
      const { url, notes } = e.detail;
      setCreationSource("url");
      setView("create");
      
      // Auto pre-populate details
      if (notes) {
        const titleInput = document.querySelector('input[placeholder="e.g. Launch Kit v1.0"]');
        if (titleInput) titleInput.value = `Clip Brief - ${new Date().toLocaleDateString()}`;
      }
    };

    window.addEventListener("SignalFlowIngestContext", handleExtensionIngest);
    return () => window.removeEventListener("SignalFlowIngestContext", handleExtensionIngest);
  }, []);

  // Scheduler Background Runner Simulator
  useEffect(() => {
    const checkQueue = setInterval(() => {
      const now = new Date();
      let queueUpdated = false;
      const queue = storageService.getScheduledPosts();
      
      const nextQueue = queue.map(post => {
        if (post.status === "scheduled" && new Date(post.scheduledAt) <= now) {
          queueUpdated = true;
          
          // Simulated Success Log
          const newLog = {
            id: `log-${Date.now()}-${Math.random()}`,
            platform: post.platform,
            contentSnippet: post.content.substring(0, 100) + "...",
            content: post.content,
            status: "posted",
            timestamp: now.toISOString(),
            connectorType: "Simulated Scheduler Runner"
          };

          // Append to log states
          setPostingLogs(prev => {
            const nextLogs = [newLog, ...prev];
            window.localStorage.setItem("signalflow_posting_logs", JSON.stringify(nextLogs));
            return nextLogs;
          });

          return {
            ...post,
            status: "posted",
            postedAt: now.toISOString()
          };
        }
        return post;
      });

      if (queueUpdated) {
        setScheduledPosts(nextQueue);
        localStorage.setItem("signalflow_scheduled_posts", JSON.stringify(nextQueue));
      }
    }, 5000); // check queue every 5 seconds

    return () => clearInterval(checkQueue);
  }, []);

  // API checks
  async function checkHealth() {
    try {
      const resp = await fetch(`${API_BASE}/health`);
      const data = await resp.json();
      setAccessLocked(Boolean(data?.access_locked));
      setPublicHosted(Boolean(data?.public_hosted));
    } catch {
      setAccessLocked(false);
      setPublicHosted(false);
    }
  }

  async function fetchBackendSocialStatus() {
    try {
      const authHeader = accessToken ? { "Authorization": `Bearer ${accessToken}` } : {};
      const resp = await fetch(`${API_BASE}/social/status`, { headers: authHeader });
      if (resp.ok) {
        const data = await resp.json();
        setConnectedChannels(data.platforms || {});
        setIsOwnerAuthenticated(true);
      } else {
        setConnectedChannels({});
        setIsOwnerAuthenticated(false);
      }
    } catch (e) {
      console.error("Failed to query social credentials", e);
      setConnectedChannels({});
      setIsOwnerAuthenticated(false);
    }
  }

  // Session login
  async function unlockWorkspace(directKey = null) {
    const keyToUse = typeof directKey === "string" ? directKey : accessKey;
    setAccessMessage("");
    setError("");

    try {
      const resp = await fetch(`${API_BASE}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_key: keyToUse }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || "Access key validation failed.");
      }

      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.token);
      setAccessToken(data.token);
      setAccessKey("");
      setAccessMessage(`Unlocked successfully.`);
      setIsOwnerAuthenticated(true);
      
      try {
        const respStatus = await fetch(`${API_BASE}/social/status`, {
          headers: { "Authorization": `Bearer ${data.token}` }
        });
        if (respStatus.ok) {
          const dataStatus = await respStatus.json();
          setConnectedChannels(dataStatus.platforms || {});
        }
      } catch (e) {
        console.error("Failed to query social credentials", e);
      }
      return { success: true };
    } catch (err) {
      setAccessMessage(err.message);
      return { success: false, error: err.message };
    }
  }

  function handleLockWorkspace() {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAccessToken("");
    setIsOwnerAuthenticated(false);
    setConnectedChannels({});
    setAccessMessage("");
    alert("Owner session closed successfully.");
  }

  // Projects CRUD Bridge
  function handleSaveProject(proj) {
    const saved = storageService.saveProject(proj);
    setProjects(storageService.getProjects());
    if (activeProjectId === proj.id) {
      setActiveProjectId(saved.id);
    }
  }

  function handleDeleteProject(id) {
    storageService.deleteProject(id);
    setProjects(storageService.getProjects());
    setActiveProjectId(storageService.getActiveProjectId());
  }

  function handleSelectActiveProject(id) {
    storageService.setActiveProjectId(id);
    setActiveProjectId(id);
  }

  // Packages CRUD Bridge
  function handleSavePackage(pkg) {
    storageService.savePackage(pkg);
    setPackages(storageService.getPackages());
  }

  function handleDeletePackage(id) {
    storageService.deletePackage(id);
    setPackages(storageService.getPackages());
    setScheduledPosts(storageService.getScheduledPosts());
  }

  // Scheduler Queue Add Bridge
  function handleSchedulePost(pkg, scheduledTime, platforms) {
    platforms.forEach(platform => {
      const content = pkg.posts[platform] || "";
      const isConnected = connectedChannels[platform]?.connected;

      const newScheduledItem = {
        id: `sched-${Date.now()}-${platform}`,
        packageId: pkg.id,
        platform,
        scheduledAt: scheduledTime,
        status: "scheduled",
        content,
        contentSnippet: content.substring(0, 100) + "..."
      };

      storageService.saveScheduledPost(newScheduledItem);
    });

    // Also update package status to ready / scheduled
    const updatedPkg = {
      ...pkg,
      status: "scheduled",
      updatedAt: new Date().toISOString()
    };
    storageService.savePackage(updatedPkg);

    // Sync state
    setScheduledPosts(storageService.getScheduledPosts());
    setPackages(storageService.getPackages());

    alert(`Successfully enqueued publishing for ${platforms.join(", ")}!`);
  }

  async function handlePublishNow(platform, content, pkgTitle = "") {
    const isConnected = connectedChannels[platform]?.connected;
    
    // Determine if it is a real connected account or a mock
    const connection = connectedChannels[platform];
    const isRealOAuth = connection && !connection.manualOnly && connection.profile && connection.profile.username !== "mock_creator";

    if (!isConnected) {
      alert(`Your ${platform} account is not connected. Link it in Connected Channels first.`);
      return;
    }

    const confirmed = window.confirm(`Publish post to ${platform.toUpperCase()} now?`);
    if (!confirmed) return;

    if (isRealOAuth) {
      try {
        const authHeader = accessToken ? { "Authorization": `Bearer ${accessToken}` } : {};
        const resp = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            platform,
            content,
            projectName: activeProject?.name || pkgTitle,
            options: {
              subreddit: "test",
              title: pkgTitle
            }
          })
        });
        
        const data = await resp.json();
        if (!resp.ok || data.ok === false) {
          throw new Error(data.error || "Publishing failed.");
        }

        const newLog = {
          id: `log-${Date.now()}`,
          platform,
          contentSnippet: content.substring(0, 100) + "...",
          content,
          status: "posted",
          timestamp: new Date().toISOString(),
          connectorType: "Official OAuth API",
          postUrl: data.postUrl
        };
        const nextLogs = [newLog, ...postingLogs];
        setPostingLogs(nextLogs);
        window.localStorage.setItem("signalflow_posting_logs", JSON.stringify(nextLogs));
        alert("Published successfully via official API!");
      } catch (err) {
        alert(`API posting failed: ${err.message}. Saving failed post log.`);
        const newLog = {
          id: `log-${Date.now()}`,
          platform,
          contentSnippet: content.substring(0, 100) + "...",
          content,
          status: "failed",
          timestamp: new Date().toISOString(),
          connectorType: "Official OAuth API",
          error: err.message
        };
        const nextLogs = [newLog, ...postingLogs];
        setPostingLogs(nextLogs);
        window.localStorage.setItem("signalflow_posting_logs", JSON.stringify(nextLogs));
      }
    } else {
      const now = new Date();
      const newLog = {
        id: `log-${Date.now()}`,
        platform,
        contentSnippet: content.substring(0, 100) + "...",
        content,
        status: "posted",
        timestamp: now.toISOString(),
        connectorType: "Simulated Demo Connector"
      };

      const nextLogs = [newLog, ...postingLogs];
      setPostingLogs(nextLogs);
      window.localStorage.setItem("signalflow_posting_logs", JSON.stringify(nextLogs));
      alert(`[Demo Mode] Post published successfully to ${platform.toUpperCase()} (Simulated).`);
    }
  }

  async function handleExport(endpoint, fileExtension, generationResult) {
    const projName = activeProject?.name || "SignalFlow Project";
    const filename = `${projName.toLowerCase().replace(/\s+/g, "-")}-package.${fileExtension}`;
    
    const payload = {
      package: generationResult.package || generationResult.json,
      projectName: projName,
      prompt: generationResult.chatbot_prompt || "",
      metadata: {
        providerUsed: generationResult.providerUsed,
        fallbackUsed: generationResult.fallbackUsed,
        selectedChannels: generationResult.channels || [],
        selectedOutputs: generationResult.outputs || []
      }
    };

    try {
      const authHeader = accessToken ? { "Authorization": `Bearer ${accessToken}` } : {};
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`Export failed (HTTP ${resp.status})`);
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
      alert(`Export failed: ${err.message}`);
    }
  }

  // Channels connections OAuth handoff simulator
  function handleConnectPlatform(platformId) {
    // Check if hosted key lock is present, use official redirect
    if (accessLocked && !accessToken) {
      alert("Please unlock the workspace credentials lock first.");
      return;
    }
    
    // Simulate connection for mockup/local run
    const updatedChannels = {
      ...connectedChannels,
      [platformId]: {
        connected: true,
        profile: { name: "Mock Creator", username: "mock_creator" },
        connectedAt: Date.now()
      }
    };
    setConnectedChannels(updatedChannels);
    storageService.saveConnectedChannels(updatedChannels);
    alert(`Linked mock connector for ${platformId.toUpperCase()}`);
  }

  function handleDisconnectPlatform(platformId) {
    const updatedChannels = {
      ...connectedChannels,
      [platformId]: {
        connected: false,
        profile: null,
        connectedAt: null
      }
    };
    setConnectedChannels(updatedChannels);
    storageService.saveConnectedChannels(updatedChannels);
  }

  // Connections Tester
  async function handleTestConnection(providerKey, config) {
    setIsTestingSettings(true);
    setTestResult(null);

    try {
      const authHeader = accessToken ? { "Authorization": `Bearer ${accessToken}` } : {};
      const resp = await fetch(`${API_BASE}/provider_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          provider: providerKey,
          modelName: config.model || "",
          baseUrl: config.baseUrl || "",
          temporaryApiKey: config.apiKey || ""
        })
      });

      const data = await resp.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ ok: false, error: e.message });
    } finally {
      setIsTestingSettings(false);
    }
  }

  // Backup handlers
  function handleImportBackup(imported) {
    if (imported.projects) localStorage.setItem("signalflow_projects", JSON.stringify(imported.projects));
    if (imported.packages) localStorage.setItem("signalflow_packages", JSON.stringify(imported.packages));
    if (imported.scheduledPosts) localStorage.setItem("signalflow_scheduled_posts", JSON.stringify(imported.scheduledPosts));
    if (imported.aiSettings) localStorage.setItem("signalflow_ai_settings", JSON.stringify(imported.aiSettings));
    
    setProjects(storageService.getProjects());
    setPackages(storageService.getPackages());
    setScheduledPosts(storageService.getScheduledPosts());
    setAiSettings(storageService.getAISettings());
  }

  function handleExportBackup() {
    const backup = {
      projects,
      packages,
      scheduledPosts,
      aiSettings
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signalflow-backup-${Date.now()}.json`;
    a.click();
  }

  function handleClearAll() {
    if (confirm("Reset everything? All brand profiles, packages, and schedules will be permanently deleted.")) {
      localStorage.clear();
      setProjects([]);
      setPackages([]);
      setScheduledPosts([]);
      setPostingLogs([]);
      setAiSettings(storageService.getAISettings());
      setView("dashboard");
    }
  }

  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }

  return (
    <div style={styles.appContainer}>
      {accessLocked && !accessToken && !publicHosted ? (
        <section style={styles.lockPanel}>
          <div style={styles.lockHeader}>
            <div style={styles.lockIcon}>🔒</div>
            <h2 style={styles.lockTitle}>SignalFlow Workspace Locked</h2>
            <p style={styles.lockDesc}>This instance requires the owner password key to unlock generative modules.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); unlockWorkspace(); }} style={styles.lockForm}>
            <input
              type="password"
              placeholder="Enter owner access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              style={styles.lockInput}
              required
            />
            <button type="submit" style={styles.lockBtn}>Unlock Workspace</button>
          </form>
          {accessMessage && <p style={styles.lockMsg}>{accessMessage}</p>}
        </section>
      ) : (
        <>
          <Sidebar
            view={view}
            setView={setView}
            activeProjectName={activeProject?.name}
            aiStatus={activeAiStatus}
          />
          
          <main style={styles.mainContent}>
            {view === "dashboard" && (
              <Dashboard
                projects={projects}
                activeProjectId={activeProjectId}
                packages={packages}
                scheduledPosts={scheduledPosts}
                connectedChannels={connectedChannels}
                aiSettings={aiSettings}
                setView={setView}
                setActiveProjectId={handleSelectActiveProject}
                onSelectPackage={(pkg) => {
                  setView("library");
                }}
                setCreationSource={setCreationSource}
                accessLocked={accessLocked}
                publicHosted={publicHosted}
                isOwnerAuthenticated={isOwnerAuthenticated}
              />
            )}

            {view === "create" && (
              <ContentPackageCreationFlow
                activeProject={activeProject}
                aiSettings={aiSettings}
                onSavePackage={handleSavePackage}
                setView={setView}
                initialSource={creationSource}
                onPublishNow={handlePublishNow}
                onSchedulePost={handleSchedulePost}
                onExport={handleExport}
              />
            )}

            {view === "library" && (
              <ContentLibrary
                projects={projects}
                packages={packages}
                onSavePackage={handleSavePackage}
                onDeletePackage={handleDeletePackage}
                onSchedulePost={handleSchedulePost}
                setView={setView}
              />
            )}

            {view === "projects" && (
              <ProjectManager
                projects={projects}
                activeProjectId={activeProjectId}
                onSave={handleSaveProject}
                onDelete={handleDeleteProject}
                onSelectActive={handleSelectActiveProject}
              />
            )}

            {view === "channels" && (
              <ChannelsConnector
                connectedChannels={connectedChannels}
                onConnectPlatform={handleConnectPlatform}
                onDisconnectPlatform={handleDisconnectPlatform}
                postingLogs={postingLogs}
                accessLocked={accessLocked}
                publicHosted={publicHosted}
                isOwnerAuthenticated={isOwnerAuthenticated}
              />
            )}

            {view === "settings" && (
              <SettingsManager
                aiSettings={aiSettings}
                onSaveSettings={(s) => {
                  storageService.saveAISettings(s);
                  setAiSettings(s);
                }}
                onTestConnection={handleTestConnection}
                isTesting={isTestingSettings}
                testResult={testResult}
                clearTestData={() => setTestResult(null)}
                onImportData={handleImportBackup}
                onExportData={handleExportBackup}
                onClearAllData={handleClearAll}
                accessLocked={accessLocked}
                publicHosted={publicHosted}
                isOwnerAuthenticated={isOwnerAuthenticated}
                onUnlockWorkspace={unlockWorkspace}
                onLockWorkspace={handleLockWorkspace}
                accessMessage={accessMessage}
                clearAccessMessage={() => setAccessMessage("")}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: "transparent",
    color: "#121612"
  },
  mainContent: {
    flexGrow: 1,
    height: "100%",
    overflowY: "auto",
    background: "transparent"
  },
  lockPanel: {
    margin: "auto",
    maxWidth: "400px",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    padding: "36px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(18, 22, 18, 0.05)"
  },
  lockHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  lockIcon: {
    fontSize: "36px"
  },
  lockTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#121612",
    margin: 0
  },
  lockDesc: {
    fontSize: "13px",
    color: "#59635c",
    lineHeight: "1.5",
    margin: 0
  },
  lockForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  lockInput: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.12)",
    color: "#121612",
    padding: "12px",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    textAlign: "center"
  },
  lockBtn: {
    background: "#24715d",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
  },
  lockMsg: {
    fontSize: "12px",
    color: "#f43f5e",
    margin: 0
  }
};
