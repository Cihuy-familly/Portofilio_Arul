import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function ContactSection({ socials, email }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const contactEmail = email || "Trigustiwanfachruly@gmail.com";

  const socialIcons = {
    instagram: "IG",
    linkedin: "in",
    tiktok: "TT",
    youtube: "YT",
  };

  const resolvePlatformKey = (social) => {
    const label = (social.label || "").toLowerCase();
    const url = (social.url || "").toLowerCase();
    if (label.includes("instagram") || url.includes("instagram.com")) return "instagram";
    if (label.includes("linkedin") || url.includes("linkedin.com")) return "linkedin";
    if (label.includes("tiktok") || url.includes("tiktok.com")) return "tiktok";
    if (label.includes("youtube") || url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    return "social";
  };

  return (
    <section className="section section-contact" id="contact" ref={sectionRef}>
      <motion.div
        className="section-divider"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      <motion.div
        className="section-label"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <span className="section-number">05</span>
        <h2 className="section-title">Contact</h2>
      </motion.div>

      <motion.div
        className="contact-content"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className="contact-intro">
          Interested in collaborating or have a project in mind? Reach out
          through any of the channels below.
        </p>

        <a href={`mailto:${contactEmail}`} className="contact-email">
          {contactEmail}
        </a>

        <div className="contact-socials">
          {socials?.map((social) => {
            const platformKey = resolvePlatformKey(social);
            return (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className={`contact-social-link ${platformKey}`}
              >
                <span className="contact-social-icon">{socialIcons[platformKey] || "SM"}</span>
                <span className="contact-social-name">{social.label}</span>
              </a>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
