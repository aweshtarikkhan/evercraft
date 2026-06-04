import React from "react";

interface TextMarqueeProps {
  items: string[];
  speed?: number;
  bgColor?: string;
  textColor?: string;
  separator?: string;
  dark?: boolean;
  className?: string;
}

export function TextMarquee({ 
  items, 
  speed = 25, 
  bgColor = "#FAF5EF", 
  textColor = "#5C3A21", 
  separator = "✦",
  dark = false,
  className = ""
}: TextMarqueeProps) {
  // Duplicate items for seamless loop
  const allItems = [...items, ...items, ...items, ...items];
  
  return (
    <div 
      className={`marquee-container ${dark ? 'dark' : ''} ${className}`}
      style={{ background: bgColor, padding: "14px 0" }}
    >
      <div 
        className="marquee-track" 
        style={{ animationDuration: `${speed}s` }}
      >
        {allItems.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "0 20px" }}>
            <span style={{ color: textColor, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {item}
            </span>
            <span style={{ color: "#D4AF37", fontSize: 10, opacity: 0.6 }}>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
