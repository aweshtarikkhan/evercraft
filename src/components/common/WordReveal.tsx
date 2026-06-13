import React from "react";
import { motion } from "framer-motion";

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  style?: React.CSSProperties;
  delay?: number;
  once?: boolean;
}

export function WordReveal({
  text,
  className = "",
  wordClassName = "",
  style = {},
  delay = 0.4,
  once = true
}: WordRevealProps) {
  if (!text) return null;

  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (customDelay: number) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: customDelay,
      },
    }),
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: "45%",
      rotateX: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const, // expoOut easing curve
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        perspective: "1000px",
        rowGap: "0.1em",
        ...style,
      }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      custom={delay}
    >
      {words.map((word, i) => {
        const isGoldItalic = /_([^_]+)_/.test(word);
        const isRegularItalic = /\*([^*]+)\*/.test(word);
        const displayWord = word.replace(/[_*]/g, "");

        return (
          <span
            key={i}
            style={{
              overflow: "hidden",
              display: "inline-block",
              marginRight: "0.22em",
              paddingBottom: "0.08em",
            }}
          >
            <motion.span
              className={`${wordClassName} ${isGoldItalic ? "text-gold italic font-serif" : isRegularItalic ? "italic font-serif" : ""}`}
              style={{ display: "inline-block", paddingRight: (isGoldItalic || isRegularItalic) ? "0.15em" : "0" }}
              variants={wordVariants}
            >
              {displayWord}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}
export default WordReveal;
