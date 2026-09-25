import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 2500; // ms
    const interval = 30; // ms per tick
    const increment = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + increment, 100);
      setProgress(current);

      if (current >= 100) {
        clearInterval(timer);

        // Brief pause at 100% then fade out
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="loading-content">
            <motion.h1
              className="loading-name"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Fachruly Trigustiwan
            </motion.h1>

            <motion.p
              className="loading-role"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Creative Content
            </motion.p>

            <div className="loading-bar-track">
              <motion.div
                className="loading-bar-fill"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0, ease: "linear" }}
              />
            </div>

            <motion.span
              className="loading-percent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}