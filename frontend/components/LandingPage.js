"use client";

import { useState, useEffect } from "react";

export default function LandingPage({ onLaunch }) {
  const [packagesCount, setPackagesCount] = useState(115);
  const [timeSaved, setTimeSaved] = useState(14);
  const [activeTab, setActiveTab] = useState("clip");

  // Soft stats count-up animation
  useEffect(() => {
    const pkgInterval = setInterval(() => {
      setPackagesCount((prev) => (prev < 142 ? prev + 1 : prev));
    }, 120);

    const timeInterval = setInterval(() => {
      setTimeSaved((prev) => (prev < 18 ? prev + 1 : prev));
    }, 280);

    return () => {
      clearInterval(pkgInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const mockFeed = [
    { platform: "Twitter", icon: "🐦", title: "Scale local-first tools for creators", preview: "1/ Why local-first is the future of content creation... #buildinpublic" },
    { platform: "LinkedIn", icon: "💼", title: "Design Systems in 2026", preview: "Consistency is key. Yesterday we launched our warm sand palette, focusing on..." },
    { platform: "Newsletter", icon: "📧", title: "SignalFlow Weekly Issue 12", preview: "Welcome back! Today we are discussing safe client-side browser storage and keys..." },
    { platform: "Instagram", icon: "📸", title: "Visual Assets Automation", preview: "Preview of automatically generated graphic cards for developer tutorials." },
    { platform: "Reddit", icon: "👽", title: "Self-hosting vs SaaS solutions", preview: "Here is why we decided to offer both owner key locking and visitor BYOK..." }
  ];

  return (
    <div style={styles.page}>
      {/* Premium Ambient Gradients */}
      <div style={styles.ambientBlob1} />
      <div style={styles.ambientBlob2} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <div style={styles.logoBadge}>SF</div>
          <span style={styles.logoText}>SignalFlow Studio</span>
        </div>
        <button onClick={onLaunch} style={styles.launchHeaderBtn}>
          Open Studio
        </button>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.badge}>
            ✨ Open Source & Local First
          </div>
          <h1 style={styles.heroTitle}>
            Scale Your Content Production, <span style={styles.accentText}>Calmly</span>
          </h1>
          <p style={styles.heroDesc}>
            SignalFlow is a distraction-free production workspace. Clip articles, capture raw notes, and convert context into ready-to-publish threads, newsletters, and social drafts.
          </p>
          <div style={styles.ctaGroup}>
            <button onClick={onLaunch} style={styles.heroCta}>
              Launch Studio Workspace →
            </button>
            <a href="#features" style={styles.heroSecondaryCta}>
              Explore Features
            </a>
          </div>

          {/* Quick Metrics */}
          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricVal}>{packagesCount}</div>
              <div style={styles.metricLabel}>Draft Packages Generated</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricVal}>{timeSaved}h</div>
              <div style={styles.metricLabel}>Estimated Time Saved</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricVal}>100%</div>
              <div style={styles.metricLabel}>Local Storage Privacy</div>
            </div>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.imageCard}>
            <img
              src="/landing_hero_mockup.png"
              alt="SignalFlow Dashboard Mockup"
              style={styles.heroImage}
            />
            {/* Soft Floating Card */}
            <div style={styles.floatingCard}>
              <div style={styles.floatingIndicator}>
                <div style={styles.statusPulse} />
                <span>Active Generation Session</span>
              </div>
              <p style={styles.floatingText}>"Create 3 Twitter posts from last interview draft"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Content Showcase (Scrolling Feed) */}
      <section style={styles.feedSection}>
        <div style={styles.feedHeader}>
          <h3 style={styles.feedTitle}>Active Workspace Operations</h3>
          <p style={styles.feedDesc}>Real-time simulation of cross-platform post builds and distributions.</p>
        </div>

        <div style={styles.feedScrollWrapper}>
          <div style={styles.feedTrack}>
            {/* Render Twice for Infinite Loop */}
            {[...mockFeed, ...mockFeed].map((item, index) => (
              <div key={index} style={styles.feedItem}>
                <div style={styles.feedItemHeader}>
                  <span style={styles.feedIcon}>{item.icon}</span>
                  <span style={styles.feedPlatform}>{item.platform}</span>
                  <span style={styles.feedLiveBadge}>Ready</span>
                </div>
                <h4 style={styles.feedItemTitle}>{item.title}</h4>
                <p style={styles.feedItemPreview}>{item.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tabs (Features Tour) */}
      <section id="features" style={styles.tourSection}>
        <h2 style={styles.tourSectionTitle}>How SignalFlow Operates</h2>
        <p style={styles.tourSectionDesc}>A clean, step-wise flow designed to bring structure to raw input files.</p>

        <div style={styles.tourLayout}>
          <div style={styles.tourTabs}>
            <button
              onClick={() => setActiveTab("clip")}
              style={{ ...styles.tourTabBtn, ...(activeTab === "clip" ? styles.tourTabBtnActive : {}) }}
            >
              <span style={styles.tourTabNum}>01</span>
              <div>
                <h4 style={styles.tourTabTitle}>Clip Context</h4>
                <p style={styles.tourTabSubtitle}>Unpacked Chrome Extension gathers article snippets.</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("formulate")}
              style={{ ...styles.tourTabBtn, ...(activeTab === "formulate" ? styles.tourTabBtnActive : {}) }}
            >
              <span style={styles.tourTabNum}>02</span>
              <div>
                <h4 style={styles.tourTabTitle}>Formulate Packages</h4>
                <p style={styles.tourTabSubtitle}>Choose AI routes to generate platform drafts.</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("safe")}
              style={{ ...styles.tourTabBtn, ...(activeTab === "safe" ? styles.tourTabBtnActive : {}) }}
            >
              <span style={styles.tourTabNum}>03</span>
              <div>
                <h4 style={styles.tourTabTitle}>Safe Client-Side Storage</h4>
                <p style={styles.tourTabSubtitle}>Your keys stay strictly in your local browser vault.</p>
              </div>
            </button>
          </div>

          <div style={styles.tourDisplay}>
            {activeTab === "clip" && (
              <div style={styles.tourContent}>
                <div style={styles.tourDisplayIcon}>🔌</div>
                <h3>Developer Chrome Extension Integration</h3>
                <p>Install the unpackaged directory in Developer Mode. Browse the web, clip paragraphs, or record voice memos. One-click pushes directly to the active workspace page tab.</p>
                <div style={styles.mockCode}>
                  // Extension Ingestion Payload<br/>
                  {"{"} url: "https://example.com/blog", title: "Building Local First"... {"}"}
                </div>
              </div>
            )}

            {activeTab === "formulate" && (
              <div style={styles.tourContent}>
                <div style={styles.tourDisplayIcon}>🤖</div>
                <h3>Context-Rich Output Generation</h3>
                <p>Run your raw context inputs through custom AI template engines. Build threads, LinkedIn messages, or news outlines in one single unified workspace draft package.</p>
                <div style={styles.mockCode}>
                  // Status: Generative Output Built Successfully<br/>
                  → 3 Platform-Native Snippets Ready in Draft Queue
                </div>
              </div>
            )}

            {activeTab === "safe" && (
              <div style={styles.tourContent}>
                <div style={styles.tourDisplayIcon}>🔒</div>
                <h3>100% Client-Side Vault Privacy</h3>
                <p>No remote databases store your AI keys or social profile metadata. If hosted, visitors configure their local keys (BYOK). Privacy model keeps credentials secure.</p>
                <div style={styles.mockCode}>
                  // Local Vault Encryption Active<br/>
                  → local_access_key: "Strictly client-side browser storage"
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 SignalFlow. Built for clarity and privacy-first production.</p>
        <div style={styles.footerLinks}>
          <a href="/TERMS.md" style={styles.footerLink}>Terms</a>
          <span style={styles.footerSeparator}>•</span>
          <a href="/PRIVACY.md" style={styles.footerLink}>Privacy</a>
        </div>
      </footer>

      {/* CSS Animation Injector */}
      <style dangerouslySetInnerHTML={{ __html: scrollAnimationCss }} />
    </div>
  );
}

// Keyframes scroll track
const scrollAnimationCss = `
  @keyframes scrollTrack {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-280px * 5)); }
  }
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #faf8f2 0%, #f5f1e7 48%, #fbfaf6 100%)",
    color: "#121612",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: "40px"
  },
  ambientBlob1: {
    position: "absolute",
    top: "-10%",
    left: "-5%",
    width: "45vw",
    height: "45vw",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(36, 113, 93, 0.05) 0%, transparent 70%)",
    zIndex: 0,
    pointerEvents: "none"
  },
  ambientBlob2: {
    position: "absolute",
    top: "30%",
    right: "-5%",
    width: "50vw",
    height: "50vw",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236, 111, 79, 0.06) 0%, transparent 70%)",
    zIndex: 0,
    pointerEvents: "none"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 8%",
    position: "relative",
    zIndex: 10
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #24715d 0%, #ec6f4f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
    boxShadow: "0 4px 12px rgba(36, 113, 93, 0.2)"
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "-0.5px"
  },
  launchHeaderBtn: {
    background: "#24715d",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(36, 113, 93, 0.15)"
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "60px",
    padding: "60px 8% 80px 8%",
    alignItems: "center",
    position: "relative",
    zIndex: 10
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "24px"
  },
  badge: {
    background: "rgba(36, 113, 93, 0.08)",
    color: "#24715d",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    textTransform: "uppercase"
  },
  heroTitle: {
    fontSize: "48px",
    lineHeight: "1.15",
    fontWeight: "800",
    letterSpacing: "-1.5px",
    margin: 0
  },
  accentText: {
    color: "#ec6f4f"
  },
  heroDesc: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#59635c",
    margin: 0,
    maxWidth: "540px"
  },
  ctaGroup: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginTop: "8px"
  },
  heroCta: {
    background: "#24715d",
    color: "#fff",
    border: "none",
    padding: "16px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(36, 113, 93, 0.25)"
  },
  heroSecondaryCta: {
    color: "#24715d",
    fontWeight: "700",
    fontSize: "15px",
    padding: "12px 16px"
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    paddingTop: "32px",
    width: "100%",
    marginTop: "16px"
  },
  metricCard: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  metricVal: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#24715d"
  },
  metricLabel: {
    fontSize: "11px",
    color: "#59635c",
    lineHeight: "1.4"
  },
  heroRight: {
    display: "flex",
    justifyContent: "center"
  },
  imageCard: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(18, 22, 18, 0.08)",
    border: "1px solid rgba(18, 22, 18, 0.06)",
    overflow: "visible",
    background: "#ffffff",
    padding: "12px"
  },
  heroImage: {
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    display: "block"
  },
  floatingCard: {
    position: "absolute",
    bottom: "-24px",
    left: "-24px",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 10px 25px rgba(18, 22, 18, 0.06)",
    maxWidth: "240px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  floatingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#24715d",
    textTransform: "uppercase"
  },
  statusPulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#24715d",
    animation: "pulse 2s infinite"
  },
  floatingText: {
    fontSize: "12px",
    margin: 0,
    color: "#59635c",
    fontStyle: "italic"
  },
  feedSection: {
    padding: "60px 0",
    background: "rgba(18, 22, 18, 0.02)",
    borderTop: "1px solid rgba(18, 22, 18, 0.04)",
    borderBottom: "1px solid rgba(18, 22, 18, 0.04)"
  },
  feedHeader: {
    padding: "0 8%",
    marginBottom: "24px"
  },
  feedTitle: {
    fontSize: "20px",
    fontWeight: "800",
    margin: 0
  },
  feedDesc: {
    fontSize: "14px",
    color: "#59635c",
    margin: "4px 0 0 0"
  },
  feedScrollWrapper: {
    overflow: "hidden",
    width: "100%",
    display: "flex"
  },
  feedTrack: {
    display: "flex",
    gap: "20px",
    padding: "10px 20px",
    animation: "scrollTrack 30s linear infinite",
    width: "max-content"
  },
  feedItem: {
    width: "280px",
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.06)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 4px 15px rgba(18, 22, 18, 0.02)"
  },
  feedItemHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px"
  },
  feedIcon: {
    fontSize: "14px"
  },
  feedPlatform: {
    fontWeight: "700",
    flexGrow: 1
  },
  feedLiveBadge: {
    fontSize: "9px",
    background: "rgba(36, 113, 93, 0.08)",
    color: "#24715d",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "700"
  },
  feedItemTitle: {
    fontSize: "13px",
    fontWeight: "700",
    margin: 0,
    color: "#121612"
  },
  feedItemPreview: {
    fontSize: "11px",
    color: "#59635c",
    margin: 0,
    lineHeight: "1.4",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  tourSection: {
    padding: "100px 8%",
    position: "relative",
    zIndex: 10
  },
  tourSectionTitle: {
    fontSize: "32px",
    fontWeight: "800",
    textAlign: "center",
    margin: 0
  },
  tourSectionDesc: {
    fontSize: "16px",
    color: "#59635c",
    textAlign: "center",
    margin: "8px 0 60px 0"
  },
  tourLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "40px",
    alignItems: "center"
  },
  tourTabs: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  tourTabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    background: "transparent",
    border: "1px solid rgba(18, 22, 18, 0.05)",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease"
  },
  tourTabBtnActive: {
    background: "#ffffff",
    borderColor: "rgba(18, 22, 18, 0.1)",
    boxShadow: "0 10px 25px rgba(18, 22, 18, 0.04)"
  },
  tourTabNum: {
    fontSize: "24px",
    fontWeight: "800",
    color: "rgba(18, 22, 18, 0.15)"
  },
  tourTabTitle: {
    fontSize: "15px",
    fontWeight: "700",
    margin: 0,
    color: "#121612"
  },
  tourTabSubtitle: {
    fontSize: "12px",
    color: "#59635c",
    margin: "4px 0 0 0",
    lineHeight: "1.4"
  },
  tourDisplay: {
    background: "#ffffff",
    border: "1px solid rgba(18, 22, 18, 0.08)",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 15px 40px rgba(18, 22, 18, 0.02)",
    minHeight: "320px",
    display: "flex",
    alignItems: "center"
  },
  tourContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  tourDisplayIcon: {
    fontSize: "36px"
  },
  mockCode: {
    background: "rgba(18, 22, 18, 0.03)",
    padding: "16px",
    borderRadius: "8px",
    fontFamily: "Courier, monospace",
    fontSize: "12px",
    color: "#24715d",
    lineHeight: "1.5",
    borderLeft: "4px solid #24715d"
  },
  footer: {
    borderTop: "1px solid rgba(18, 22, 18, 0.08)",
    padding: "40px 8% 0 8%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 10
  },
  footerText: {
    fontSize: "13px",
    color: "#59635c",
    margin: 0
  },
  footerLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },
  footerLink: {
    fontSize: "13px",
    color: "#24715d",
    fontWeight: "600"
  },
  footerSeparator: {
    color: "rgba(18, 22, 18, 0.2)",
    fontSize: "12px"
  }
};
