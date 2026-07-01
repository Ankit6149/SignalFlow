"use client";

import { useState, useEffect, useRef } from "react";
import { Icons } from "./Icons";

export default function LandingPage({ onLaunch }) {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef({});

  // Header scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.05 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Fallback to reveal all sections in case IntersectionObserver is delayed or blocked
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleSections((prev) => {
        const next = new Set(prev);
        ["features", "how", "privacy", "cta"].forEach(id => next.add(id));
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div style={s.page} id="top">
      {/* ─── Sticky Header ─── */}
      <header style={{ ...s.header, ...(scrolled ? s.headerScrolled : {}) }}>
        <div style={s.headerInner}>
          <a onClick={scrollToTop} style={{ ...s.logoGroup, cursor: 'pointer', textDecoration: 'none' }}>
            <div style={s.logoBadge} className="hand-drawn">SF</div>
            <span style={s.logoText}>SignalFlow Studio</span>
          </a>
          <nav style={s.headerNav}>
            <a href="#features" className="nav-link-item">Features</a>
            <a href="#how" className="nav-link-item">How It Works</a>
            <a href="#privacy" className="nav-link-item">Privacy</a>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio" target="_blank" rel="noreferrer" className="nav-link-item">GitHub</a>
            <button onClick={onLaunch} style={s.headerCta} className="hand-drawn-btn">
              Open Studio →
            </button>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <span style={s.heroPill} className="hand-drawn">✦ Open Source · Local First · Privacy Native</span>
          <h1 style={s.heroTitle}>
            Turn raw ideas into<br />
            <span style={s.heroAccent}>publish‑ready content</span>
          </h1>
          <p style={s.heroSub}>
            SignalFlow is a distraction-free workspace that converts notes, screen recordings, 
            and code into polished social posts, threads, and newsletters — all running locally 
            on your machine.
          </p>
          <div style={s.heroBtnRow}>
            <button onClick={onLaunch} style={s.heroBtn} className="hand-drawn-btn">
              Launch Workspace
            </button>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio" target="_blank" rel="noreferrer" style={s.heroGhBtn} className="hand-drawn-btn">
              <span style={{ marginRight: "6px", display: "inline-flex", alignItems: "center" }}><Icons.star size={14} color="var(--ink-black)" /></span>
              <span>Star on GitHub</span>
            </a>
          </div>
          <div style={s.heroStats}>
            <div style={s.stat}>
              <span style={s.statNum}>6</span>
              <span style={s.statLabel}>Source Inputs</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>7+</span>
              <span style={s.statLabel}>Platform Outputs</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>100%</span>
              <span style={s.statLabel}>Client-Side Keys</span>
            </div>
          </div>
        </div>

        {/* Hero Visual — real photo */}
        <div style={s.heroVisual}>
          <div style={s.heroImageWrap} className="hand-drawn float-effect">
            <img
              src="/hero-workspace.png"
              alt="Clean content creation workspace"
              style={s.heroPhoto}
            />
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section
        id="features"
        ref={(el) => (sectionRefs.current.features = el)}
        style={{ ...s.section, ...(isVisible("features") ? s.sectionVisible : s.sectionHidden) }}
      >
        <div style={s.sectionInner}>
          <span style={s.sectionPill}>Features</span>
          <h2 style={s.sectionTitle}>Everything you need, nothing you don't</h2>
          <p style={s.sectionSub}>
            A focused set of tools designed around one goal — getting your content published faster.
          </p>
          <div style={s.featureGrid}>
            {[
              { icon: <Icons.manual size={24} color="var(--pastel-green-border)" />, title: "Multi-Source Input", desc: "Write manually, record your screen, paste URLs, upload images, scan GitHub repos, or paste changelogs. Six input types, one unified flow." },
              { icon: <Icons.sparkle size={24} color="var(--pastel-yellow-border)" />, title: "AI-Powered Drafts", desc: "Route through Gemini, OpenAI, Claude, Ollama, or offline templates. Bring your own API key — it never leaves your browser." },
              { icon: <Icons.channels size={24} color="var(--pastel-blue-border)" />, title: "Platform-Native Output", desc: "Generate content tailored for LinkedIn, X/Twitter, Instagram, Reddit, newsletters, and dev blogs simultaneously." },
              { icon: <Icons.profiles size={24} color="var(--pastel-lavender-border)" />, title: "Brand Profiles", desc: "Save multiple brand voices with audience targeting, tone presets, and platform preferences per project." },
              { icon: <Icons.library size={24} color="var(--pastel-red-border)" />, title: "Content Library", desc: "Every generated package is saved with full context. Search, edit, re-export, or republish from your local archive." },
              { icon: <Icons.workspace size={24} color="var(--ink-black)" />, title: "Self-Host Ready", desc: "Run on your machine with npm. No accounts, no databases, no cloud dependencies. Your data stays yours." },
            ].map((f, i) => {
              const pastelColors = ["var(--pastel-green)", "var(--pastel-yellow)", "var(--pastel-blue)", "var(--pastel-lavender)", "var(--pastel-red)", "#f1f5f9"];
              return (
                <div key={i} style={{ ...s.featureCard, background: pastelColors[i % pastelColors.length] }} className="hand-drawn hover-lift">
                  <div style={s.featureIcon}>{f.icon}</div>
                  <h3 style={s.featureTitle}>{f.title}</h3>
                  <p style={s.featureDesc}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Lifestyle Photo Break ─── */}
      <section style={s.photoBanner}>
        <img
          src="/creator-working.png"
          alt="Creator working in a modern workspace"
          style={s.bannerPhoto}
        />
        <div style={s.bannerOverlay}>
          <p style={s.bannerQuote} className="handwritten">
            "Built for creators who'd rather spend time building than writing about it."
          </p>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how"
        ref={(el) => (sectionRefs.current.how = el)}
        style={{ ...s.sectionAlt, ...(isVisible("how") ? s.sectionVisible : s.sectionHidden) }}
      >
        <div style={s.sectionInner}>
          <span style={s.sectionPill} className="hand-drawn">How It Works</span>
          <h2 style={s.sectionTitle}>Three steps from idea to publish</h2>
          <p style={s.sectionSub}>No complex setup. No learning curve. Just follow the steps.</p>

          <div style={s.stepsRow}>
            {[
              { num: "01", title: "Add Your Context", desc: "Drop in screenshots, paste a URL, record a walkthrough, or type raw notes. SignalFlow understands what you built." },
              { num: "02", title: "Set Your Voice", desc: "Pick a tone, select target platforms, and let the AI engine draft platform-native posts for each channel." },
              { num: "03", title: "Review & Publish", desc: "Edit the generated drafts inline, preview how they look on each platform, then export or publish directly." },
            ].map((step, i) => {
              const stepPastels = ["var(--pastel-yellow)", "var(--pastel-green)", "var(--pastel-blue)"];
              return (
                <div key={i} style={{ ...s.stepCard, background: stepPastels[i % stepPastels.length] }} className="hand-drawn hover-lift">
                  <div style={s.stepNum}>{step.num}</div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                  {i < 2 && <div style={s.stepArrow} className="arrow-bounce">→</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Privacy ─── */}
      <section
        id="privacy"
        ref={(el) => (sectionRefs.current.privacy = el)}
        style={{ ...s.section, ...(isVisible("privacy") ? s.sectionVisible : s.sectionHidden) }}
      >
        <div style={s.sectionInner}>
          <span style={s.sectionPill} className="hand-drawn">Privacy Model</span>
          <h2 style={s.sectionTitle}>Your keys. Your data. Your machine.</h2>
          <p style={s.sectionSub}>
            SignalFlow stores API keys and content exclusively in your browser's local storage. 
            Nothing is sent to any server we control.
          </p>
          <div style={s.privacySplit}>
            <div style={s.privacyCards}>
              {[
                { icon: <Icons.key size={24} color="var(--pastel-yellow-border)" />, title: "BYOK Architecture", desc: "Bring Your Own Key — credentials are stored in browser localStorage and sent directly to the AI provider." },
                { icon: <Icons.database size={24} color="var(--pastel-blue-border)" />, title: "Zero Server Storage", desc: "No databases, no accounts, no analytics. Projects and drafts persist in IndexedDB on your device." },
                { icon: <Icons.security size={24} color="var(--pastel-green-border)" />, title: "Self-Host Control", desc: "Clone the repo, run locally, and deploy behind your own firewall. Full source code is MIT licensed." },
              ].map((item, i) => {
                const privacyPastels = ["var(--pastel-yellow)", "var(--pastel-blue)", "var(--pastel-green)"];
                return (
                  <div key={i} style={{ ...s.privacyCard, background: privacyPastels[i % privacyPastels.length] }} className="hand-drawn hover-lift">
                    <div style={s.privacyIcon}>{item.icon}</div>
                    <div>
                      <h3 style={s.privacyTitle}>{item.title}</h3>
                      <p style={s.privacyDesc}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={s.privacyPhotoWrap} className="hand-drawn">
              <img
                src="/office-setup.png"
                alt="Professional home office setup"
                style={s.privacyPhoto}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        id="cta"
        ref={(el) => (sectionRefs.current.cta = el)}
        style={{ ...s.ctaSection, ...(isVisible("cta") ? s.sectionVisible : s.sectionHidden) }}
      >
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Ready to streamline your content?</h2>
          <p style={s.ctaSub}>
            Open the workspace and create your first content package in under 5 minutes.
          </p>
          <div style={s.ctaBtnRow}>
            <button onClick={onLaunch} style={s.ctaBtn} className="hand-drawn-btn">Open Studio Workspace →</button>
            <a
              href="https://github.com/Ankit6149/SignalFlow-Studio"
              target="_blank"
              rel="noreferrer"
              style={s.ctaGhBtn}
              className="hand-drawn-btn"
            >
              View Source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          {/* Brand Column */}
          <div style={s.footerBrand}>
            <a onClick={scrollToTop} style={{ ...s.logoGroup, cursor: 'pointer', textDecoration: 'none' }}>
              <div style={s.logoBadge}>SF</div>
              <span style={{ ...s.logoText, fontSize: '15px' }}>SignalFlow Studio</span>
            </a>
            <p style={s.footerNote}>Open-source content production workspace.<br />Built for creators who value privacy and speed.</p>
          </div>

          {/* Product Column */}
          <div style={s.footerCol}>
            <h4 style={s.footerColTitle}>Product</h4>
            <a href="#features" style={s.footerLink}>Features</a>
            <a href="#how" style={s.footerLink}>How It Works</a>
            <a onClick={onLaunch} style={{ ...s.footerLink, cursor: 'pointer' }}>Open Studio</a>
          </div>

          {/* Resources Column */}
          <div style={s.footerCol}>
            <h4 style={s.footerColTitle}>Resources</h4>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio" target="_blank" rel="noreferrer" style={s.footerLink}>GitHub Repository</a>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio#readme" target="_blank" rel="noreferrer" style={s.footerLink}>Documentation</a>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio/issues" target="_blank" rel="noreferrer" style={s.footerLink}>Report an Issue</a>
          </div>

          {/* Legal Column */}
          <div style={s.footerCol}>
            <h4 style={s.footerColTitle}>Legal</h4>
            <a href="#privacy" style={s.footerLink}>Privacy Model</a>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio/blob/master/TERMS.md" target="_blank" rel="noreferrer" style={s.footerLink}>Terms of Use</a>
            <a href="https://github.com/Ankit6149/SignalFlow-Studio/blob/master/LICENSE" target="_blank" rel="noreferrer" style={s.footerLink}>MIT License</a>
          </div>
        </div>

        <div style={s.footerBottom}>
          <span style={s.footerCopy}>© {new Date().getFullYear()} SignalFlow Studio. Open source under the MIT License.</span>
          <a onClick={scrollToTop} style={s.backToTop}>↑ Back to top</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: animationCss }} />
    </div>
  );
}

const animationCss = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  html { scroll-behavior: smooth; }
  
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .hover-lift:hover {
    transform: translateY(-6px) scale(1.01) !important;
    box-shadow: 0 20px 38px rgba(45, 106, 79, 0.08) !important;
  }
  
  .nav-link-item {
    position: relative;
    color: #6b6b6b;
    text-decoration: none;
    transition: color 0.25s ease;
  }
  .nav-link-item::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: #2d6a4f;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }
  .nav-link-item:hover {
    color: #2d6a4f !important;
  }
  .nav-link-item:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
  
  .arrow-bounce {
    display: inline-block;
    animation: bounceRight 2.2s infinite;
  }
  @keyframes bounceRight {
    0%, 100%, 20%, 50%, 80% { transform: translateX(0); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(3px); }
  }
  
  .btn-premium {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .btn-premium:hover {
    transform: translateY(-2px) scale(1.02) !important;
    filter: brightness(1.15);
    box-shadow: 0 8px 20px rgba(45, 106, 79, 0.15) !important;
  }
  
  .btn-premium-dark {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .btn-premium-dark:hover {
    transform: translateY(-2px) scale(1.02) !important;
    background: #1a1a1a !important;
    color: #fff !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
  }
`;

const s = {
  /* ── Page ── */
  page: {
    minHeight: "100vh",
    background: "#faf9f6",
    color: "#1a1a1a",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    overflowX: "hidden",
  },

  /* ── Header ── */
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "16px 0",
    transition: "all 0.3s ease",
    background: "transparent",
  },
  headerScrolled: {
    background: "rgba(250, 249, 246, 0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    padding: "12px 0",
  },
  headerInner: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #2d6a4f, #52b788)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
  },
  logoText: {
    fontSize: "17px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    color: "#1a1a1a",
  },
  headerNav: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  navLink: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b6b6b",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  headerCta: {
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    padding: "9px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  /* ── Hero ── */
  hero: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "140px 32px 80px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "64px",
    alignItems: "center",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heroPill: {
    display: "inline-block",
    alignSelf: "flex-start",
    background: "rgba(45, 106, 79, 0.08)",
    color: "#2d6a4f",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  heroTitle: {
    fontSize: "46px",
    fontWeight: "800",
    lineHeight: "1.12",
    letterSpacing: "-1.5px",
    color: "#1a1a1a",
    margin: 0,
  },
  heroAccent: {
    background: "linear-gradient(135deg, #2d6a4f, #52b788)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#6b6b6b",
    margin: 0,
    maxWidth: "480px",
  },
  heroBtnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  heroBtn: {
    background: "#2d6a4f",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 16px rgba(45, 106, 79, 0.25)",
  },
  heroGhBtn: {
    display: "flex",
    alignItems: "center",
    padding: "14px 24px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#1a1a1a",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginTop: "16px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#2d6a4f",
  },
  statLabel: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
  },
  statDivider: {
    width: "1px",
    height: "32px",
    background: "rgba(0,0,0,0.08)",
  },

  /* ── Hero Visual (Photo) ── */
  heroVisual: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageWrap: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 24px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
    animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  heroPhoto: {
    width: "100%",
    height: "auto",
    display: "block",
    objectFit: "cover",
  },

  /* ── Photo Banner ── */
  photoBanner: {
    position: "relative",
    height: "340px",
    overflow: "hidden",
  },
  bannerPhoto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    filter: "brightness(0.7)",
  },
  bannerOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(45,106,79,0.3), rgba(0,0,0,0.4))",
  },
  bannerQuote: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "700",
    fontStyle: "italic",
    maxWidth: "600px",
    textAlign: "center",
    lineHeight: "1.5",
    margin: 0,
    padding: "0 32px",
    letterSpacing: "-0.3px",
  },

  /* ── Privacy Split Layout ── */
  privacySplit: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    alignItems: "center",
  },
  privacyCards: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  privacyPhotoWrap: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0,0,0,0.06)",
  },
  privacyPhoto: {
    width: "100%",
    height: "auto",
    display: "block",
    objectFit: "cover",
  },

  /* ── Sections ── */
  section: {
    padding: "100px 0",
  },
  sectionAlt: {
    padding: "100px 0",
    background: "#f4f3f0",
  },
  sectionInner: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "0 32px",
  },
  sectionPill: {
    display: "inline-block",
    background: "rgba(45, 106, 79, 0.08)",
    color: "#2d6a4f",
    padding: "5px 12px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    letterSpacing: "-1px",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
    lineHeight: "1.2",
  },
  sectionSub: {
    fontSize: "16px",
    color: "#6b6b6b",
    margin: "0 0 48px 0",
    maxWidth: "560px",
    lineHeight: "1.7",
  },
  sectionHidden: {
    opacity: 0,
    transform: "translateY(28px)",
    transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  sectionVisible: {
    opacity: 1,
    transform: "translateY(0)",
    transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
  },

  /* ── Feature Cards ── */
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
  },
  featureCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "14px",
    padding: "28px 24px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  featureIcon: {
    fontSize: "28px",
    marginBottom: "14px",
  },
  featureTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#1a1a1a",
  },
  featureDesc: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#6b6b6b",
    margin: 0,
  },

  /* ── Steps ── */
  stepsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "32px",
    position: "relative",
  },
  stepCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "14px",
    padding: "32px 24px",
    position: "relative",
    textAlign: "center",
  },
  stepNum: {
    fontSize: "36px",
    fontWeight: "800",
    color: "rgba(45, 106, 79, 0.15)",
    marginBottom: "12px",
  },
  stepTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    color: "#1a1a1a",
  },
  stepDesc: {
    fontSize: "14px",
    lineHeight: "1.65",
    color: "#6b6b6b",
    margin: 0,
  },
  stepArrow: {
    position: "absolute",
    right: "-22px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    color: "rgba(45, 106, 79, 0.3)",
    fontWeight: "700",
    zIndex: 2,
  },

  /* ── Privacy Cards ── */
  privacyCard: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "12px",
    padding: "20px",
    transition: "transform 0.2s ease",
  },
  privacyIcon: {
    fontSize: "24px",
    flexShrink: 0,
    marginTop: "2px",
  },
  privacyTitle: {
    fontSize: "15px",
    fontWeight: "700",
    margin: "0 0 6px 0",
    color: "#1a1a1a",
  },
  privacyDesc: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#6b6b6b",
    margin: 0,
  },

  /* ── CTA Section ── */
  ctaSection: {
    padding: "80px 0",
    background: "#1a1a1a",
  },
  ctaInner: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "0 32px",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  ctaSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.6)",
    margin: "0 0 32px 0",
    lineHeight: "1.6",
  },
  ctaBtnRow: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
  },
  ctaBtn: {
    background: "#52b788",
    color: "#fff",
    border: "none",
    padding: "14px 32px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(82, 183, 136, 0.3)",
  },
  ctaGhBtn: {
    padding: "14px 24px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
  },

  /* ── Footer ── */
  footer: {
    borderTop: "1px solid rgba(0,0,0,0.06)",
    background: "#f4f3f0",
  },
  footerTop: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "48px 32px 36px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "40px",
  },
  footerBrand: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerNote: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
    lineHeight: "1.6",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  footerColTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    margin: "0 0 4px 0",
  },
  footerLink: {
    fontSize: "13px",
    color: "#6b6b6b",
    textDecoration: "none",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  footerBottom: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "20px 32px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerCopy: {
    fontSize: "12px",
    color: "#aaa",
  },
  backToTop: {
    fontSize: "12px",
    color: "#2d6a4f",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
};
