import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { fallbackIgContent, fallbackWorkExperience, fallbackSkills, profile } from "./data/fallbackData";
import { fetchCmsArulContent } from "./services/strapi";
import LoadingScreen from "./components/LoadingScreen";
import SkillsSection from "./components/SkillsSection";
import ContactSection from "./components/ContactSection";
import ContentThumbnail from "./components/ContentThumbnail";

const THEME_KEY = "fachruly-portfolio-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const resolveSocialMeta = (item) => {
  const platform = `${item?.platform || ""}`.toLowerCase();
  const url = `${item?.postUrl || ""}`.toLowerCase();

  if (platform.includes("instagram") || url.includes("instagram.com")) {
    return { key: "instagram", label: "Instagram", shortLabel: "IG" };
  }
  if (platform.includes("linkedin") || url.includes("linkedin.com")) {
    return { key: "linkedin", label: "LinkedIn", shortLabel: "in" };
  }
  if (platform.includes("tiktok") || url.includes("tiktok.com")) {
    return { key: "tiktok", label: "TikTok", shortLabel: "TT" };
  }
  if (platform.includes("youtube") || url.includes("youtube.com") || url.includes("youtu.be")) {
    return { key: "youtube", label: "YouTube", shortLabel: "YT" };
  }
  return { key: "social", label: item?.platform || "Social", shortLabel: "SM" };
};

/* ═══════════════════════════════════════════════════
   Apple-style directional scroll reveal
   ═══════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const variants = {
    up: { opacity: 0, y: 36 },
    left: { opacity: 0, x: -60 },
    right: { opacity: 0, x: 60 },
    scale: { opacity: 0, scale: 0.9 },
  };

  return (
    <motion.div
      ref={ref}
      className={`reveal-dir-${direction} ${className}`}
      initial={variants[direction] || variants.up}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   Section divider (scaleX animation)
   ═══════════════════════════════════════════════════ */
function SectionDivider({ delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="section-divider"
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   Section label
   ═══════════════════════════════════════════════════ */
function SectionLabel({ number, title, isInView }) {
  return (
    <motion.div
      className="section-label"
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <span className="section-number">{number}</span>
      <h2 className="section-title">{title}</h2>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   Scroll indicator — subtle cue at bottom of hero
   ═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   Social SVG icons — clean, minimal brand marks
   ═══════════════════════════════════════════════════ */
function SocialIcon({ platform }) {
  const key = (platform || "").toLowerCase();

  /* Instagram — camera */
  if (key.includes("instagram") || key === "ig") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
  }

  /* LinkedIn */
  if (key.includes("linkedin") || key === "in") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }

  /* TikTok — music note */
  if (key.includes("tiktok") || key === "tt") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    );
  }

  /* YouTube — play */
  if (key.includes("youtube") || key === "yt") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }

  /* fallback */
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function ScrollIndicator({ progress }) {
  const scrollOpacity = useTransform(progress, [0, 0.6], [1, 0]);

  return (
    <motion.div
      className="scroll-indicator"
      style={{ opacity: scrollOpacity }}
    >
      <span>Scroll</span>
      <motion.div
        className="scroll-line"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   App
   ═══════════════════════════════════════════════════ */
function App() {
  const [loading, setLoading] = useState(true);
  const [igContent, setIgContent] = useState(fallbackIgContent);
  const [workExperience, setWorkExperience] = useState(fallbackWorkExperience);
  const [skills, setSkills] = useState(fallbackSkills);
  const [theme, setTheme] = useState(getInitialTheme);
  const [vh, setVh] = useState(0);

  /* ── Track viewport height ── */
  useEffect(() => {
    setVh(window.innerHeight);
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Lenis smooth scroll (Apple feel) ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  /* ── Strapi CMS ── */
  useEffect(() => {
    let isMounted = true;

    const loadCms = async () => {
      try {
        const result = await fetchCmsArulContent();
        if (!isMounted) return;

        const hasIg = Array.isArray(result.igContent) && result.igContent.length > 0;
        const hasWork = Array.isArray(result.workExperience) && result.workExperience.length > 0;
        const hasSkills = Array.isArray(result.skills) && result.skills.length > 0;

        if (hasIg) setIgContent(result.igContent);
        if (hasWork) setWorkExperience(result.workExperience);
        if (hasSkills) setSkills(result.skills);
      } catch {
        if (!isMounted) return;
      }
    };

    loadCms();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ── Theme ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleLoadingComplete = () => setLoading(false);

  /* ═══════════════════════════════════════════════════
     Scroll-driven hero animations (Apple-like)
     Hero progress: 0 (at top) → 1 (scrolled past 100vh)
     ═══════════════════════════════════════════════════ */
  const { scrollY } = useScroll();
  const heroProgress = useTransform(scrollY, [0, vh || 800], [0, 1]);

  const heroContentOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.92]);
  const heroImageScale = useTransform(heroProgress, [0, 0.6], [1, 1.12]);
  const heroBlur = useTransform(heroProgress, [0.3, 0.7], [0, 6]);
  const heroRadius = useTransform(heroProgress, [0, 0.5], [0, 24]);
  const heroBgDim = useTransform(heroProgress, [0, 0.5], [1, 0.85]);
  const heroImageY = useTransform(scrollY, [0, vh * 0.6 || 400], [0, -80]);

  return (
    <>
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <AnimatePresence>
        {!loading && (
          <motion.main
            className="page-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div className="bg-grid" />

            {/* ═══════════════════════════════════════════=
                01 HERO — Full-screen sticky intro
                ════════════════════════════════════════════ */}
            <div className="hero-sticky-block" style={{ height: vh || "100vh" }}>
              <section className="section hero section-hero" id="hero">
                <motion.div
                  className="hero-bg-layer"
                  style={{ opacity: heroBgDim }}
                />

                {/* Theme toggle — positioned top-right outside layout */}
                <div className="hero-theme-wrap">
                  <button type="button" className="theme-toggle" onClick={toggleTheme}>
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                </div>

                <motion.div
                  className="hero-foreground"
                  style={{
                    opacity: heroContentOpacity,
                    y: heroContentY,
                    scale: heroScale,
                  }}
                >
                  <div className="section-inner">
                    <div className="hero-layout">
                      <div className="hero-copy">
                        <div className="hero-topbar">
                          <p className="eyebrow">PORTOFOLIO KOMUNIKASI</p>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <h1>
                            {profile.name}
                            <span>{profile.role}</span>
                          </h1>
                          <p className="lead">{profile.bio}</p>

                          <div className="hero-metadata">
                            <span>{profile.major}</span>
                            <span>{profile.city}</span>
                          </div>
                        </motion.div>

                        <motion.div
                          className="hero-actions"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.45 }}
                        >
                          {profile.socials?.map((social) => (
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              className="social-action"
                              key={social.label}
                            >
                              <span className="social-tag">
                                <SocialIcon platform={social.label} />
                              </span>
                              <span>{social.label}</span>
                            </a>
                          ))}
                        </motion.div>
                      </div>

                      <motion.div
                        className="hero-visual"
                        style={{ scale: heroImageScale }}
                      >
                        <motion.img
                          src={profile.profileAltImage}
                          alt={`${profile.name} portrait`}
                          className="hero-portrait"
                          style={{
                            y: heroImageY,
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Scroll hint */}
                <ScrollIndicator progress={heroProgress} />
              </section>
            </div>

            {/* ═══════════════════════════════════════════=
                Content stack (scrolls over hero)
                ════════════════════════════════════════════ */}
            <motion.div
              className="content-stack"
              style={{
                borderRadius: heroRadius,
              }}
            >
              {/* ── 02 SKILLS ── */}
              <div className="section-inner">
                <SkillsSection skills={skills} />
              </div>

              {/* ── 03 SOCIAL CONTENT ── */}
              <SectionRefSection
                sectionClass="section section-ig"
                id="ig-content"
                number="03"
                title="Social Content"
              >
                <div className="content-list">
                  {igContent.map((item, index) => {
                    const socialMeta = resolveSocialMeta(item);
                    const dir = index % 2 === 0 ? "up" : "scale";
                    return (
                      <Reveal key={item.id} delay={index * 0.06} direction={dir}>
                        <a
                          className="ig-card"
                          href={item.postUrl || "https://instagram.com/"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="ig-card-thumb">
                            <ContentThumbnail item={item} socialMeta={socialMeta} />
                            <span className={`ig-card-badge ${socialMeta.key}`}>
                              {socialMeta.shortLabel}
                            </span>
                          </div>
                          <div className="ig-card-body">
                            <h3 className="ig-card-title">{item.title}</h3>
                            <p className="ig-card-caption">{item.caption}</p>
                            <div className="ig-card-foot">
                              <span className="metric-pill">{item.metric || "Brand Awareness"}</span>
                              <span className="ig-card-open">Buka →</span>
                            </div>
                          </div>
                        </a>
                      </Reveal>
                    );
                  })}
                </div>
              </SectionRefSection>

              {/* ── 04 WORK EXPERIENCE ── */}
              <section className="section section-work" id="work-experience">
                <div className="section-inner">
                  <SectionDivider />
                  <SectionLabel number="04" title="Work Experience" isInView />

                  <div className="work-timeline">
                    {workExperience.map((item, index) => {
                      const dir = index % 2 === 0 ? "left" : "right";
                      return (
                        <Reveal key={item.id} delay={index * 0.08} direction={dir}>
                          <article className="work-item">
                            <div className="work-line">
                              <motion.span
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.15, type: "spring", stiffness: 200 }}
                              />
                            </div>
                            <div className="work-panel">
                              <div className="work-top">
                                <h3>{item.role}</h3>
                                <p>{item.period}</p>
                              </div>
                              <p className="work-company">{item.company}</p>
                              {item.summary ? <p className="work-summary">{item.summary}</p> : null}
                              {item.highlights?.length > 0 ? (
                                <ul className="work-tags">
                                  {item.highlights.map((point) => (
                                    <li key={`${item.id}-${point}`}>{point}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </article>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* ── 05 CONTACT ── */}
              <div className="section-inner">
                <ContactSection socials={profile.socials} email={profile.email} />
              </div>

              <footer className="site-footer">
                <div className="section-inner">
                  <div className="section-divider" />
                  <p>&copy; {new Date().getFullYear()} Fachruly Trigustiwan. All rights reserved.</p>
                </div>
              </footer>
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Helper: section wrapper
   ═══════════════════════════════════════════════════ */
function SectionRefSection({ sectionClass, id, number, title, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className={sectionClass} id={id} ref={ref}>
      <div className="section-inner">
        <SectionDivider />
        <SectionLabel number={number} title={title} isInView={isInView} />
        {children}
      </div>
    </section>
  );
}

export default App;