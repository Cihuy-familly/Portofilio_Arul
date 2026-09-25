import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const defaultSkills = [
  { name: "Content Planning", emoji: "📋" },
  { name: "Videography", emoji: "🎥" },
  { name: "Photography", emoji: "📸" },
  { name: "Social Media Management", emoji: "📱" },
  { name: "Video Editing", emoji: "✂️" },
  { name: "Content Strategy", emoji: "🧠" },
  { name: "Brand Storytelling", emoji: "📖" },
  { name: "Copywriting", emoji: "✍️" },
];

export default function SkillsSection({ skills }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const data = skills || defaultSkills;

  return (
    <section className="section section-skills" id="skills" ref={sectionRef}>
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
        <span className="section-number">02</span>
        <h2 className="section-title">Skills</h2>
      </motion.div>

      <p className="section-description">
        Creative skills and expertise developed through hands-on projects and
        professional experience in content production and visual storytelling.
      </p>

      <motion.div
        className="skills-grid"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.2 },
          },
        }}
      >
        {data.map((skill) => (
          <motion.span
            key={skill.name}
            className="skill-badge"
            variants={{
              hidden: { opacity: 0, scale: 0.85, y: 20 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { duration: 0.4, ease: "easeOut" },
              },
            }}
          >
            <span className="skill-emoji">{skill.emoji}</span>
            <span className="skill-name">{skill.name}</span>
          </motion.span>
        ))}
      </motion.div>
    </section>
  );
}