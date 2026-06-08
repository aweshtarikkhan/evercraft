import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SEO } from "../components/common/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { Book } from "../types";

export function FreeReaderPage({ books }: { books: Book[] }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Filter only free books
  const freeBooks = books.filter(b => b.price === 0);

  // Determine active index
  const initialIndex = freeBooks.findIndex(b => String(b.id) === id);
  const activeIndex = initialIndex !== -1 ? initialIndex : 0;
  const activeBook = freeBooks[activeIndex];

  const [currentChapter, setCurrentChapter] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Reset chapter when book changes
  useEffect(() => {
    setCurrentChapter(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Navigate to next / previous book
  const handleNextBook = () => {
    if (freeBooks.length <= 1) return;
    setDirection(1);
    const nextIndex = (activeIndex + 1) % freeBooks.length;
    navigate(`/read/${freeBooks[nextIndex].id}`);
  };

  const handlePrevBook = () => {
    if (freeBooks.length <= 1) return;
    setDirection(-1);
    const prevIndex = (activeIndex - 1 + freeBooks.length) % freeBooks.length;
    navigate(`/read/${freeBooks[prevIndex].id}`);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevBook();
      } else if (e.key === "ArrowRight") {
        handleNextBook();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, freeBooks.length]);

  if (!activeBook) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, background: "#FAF5EF", color: "#2D1B10" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#730000", marginBottom: 12 }}>No Free Books Available</h2>
        <p style={{ color: "#5c3a21", marginBottom: 24 }}>There are no free books loaded in the database.</p>
        <Link to="/shop" className="btn-primary" style={{ textDecoration: "none" }}>← Back to Shop</Link>
      </div>
    );
  }

  // Parse chapters from description
  const rawChapters = activeBook.description.split(/--- (.*?) ---/g);
  const chapters: { title: string; content: string }[] = [];
  
  if (rawChapters[0] && rawChapters[0].trim()) {
    chapters.push({ title: "Introduction", content: rawChapters[0].trim() });
  }
  
  for (let i = 1; i < rawChapters.length; i += 2) {
    if (rawChapters[i] && rawChapters[i+1]) {
      chapters.push({ 
        title: rawChapters[i].trim(), 
        content: rawChapters[i+1].trim() 
      });
    }
  }

  if (chapters.length === 0) {
    chapters.push({ title: "Full Book", content: activeBook.description });
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const currentChapterData = chapters[currentChapter] || chapters[0];

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF", color: "#2D1B10", position: "relative", padding: "60px 20px 80px", boxSizing: "border-box" }}>
      <SEO 
        title={`Read ${activeBook.title} Online`} 
        description={`Read ${activeBook.title} for free online at EverCraft Publications.`}
      />
      {/* Subtle floating Close Button */}
      <Link
        to="/shop"
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#730000",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "13px",
          background: "rgba(115,0,0,0.05)",
          padding: "8px 16px",
          borderRadius: "20px",
          border: "1.5px solid rgba(115,0,0,0.1)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(115,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(115,0,0,0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        ✕ Close Reader
      </Link>

      <div style={{ maxWidth: 1100, margin: "40px auto 0" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeBook.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 220, damping: 25 },
              opacity: { duration: 0.2 }
            }}
            style={{ 
              display: "grid", 
              gridTemplateColumns: "1.2fr 1.8fr", 
              gap: 48, 
              alignItems: "start" 
            }}
            className="reader-slider-grid"
          >
            {/* Left Column: Book Cover with arrows */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", justifyContent: "center" }}>
                
                {/* Prev Arrow */}
                <button
                  onClick={handlePrevBook}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(115,0,0,0.1)",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#730000",
                    fontSize: "18px",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                  title="Previous Book"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAF5EF"; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  ←
                </button>

                {/* Cover Image container */}
                <div style={{ position: "relative" }}>
                  {activeBook.frontCover ? (
                    <img
                      src={activeBook.frontCover}
                      alt={activeBook.title}
                      style={{
                        width: 250,
                        height: 350,
                        borderRadius: 12,
                        objectFit: "cover",
                        boxShadow: "0 20px 40px rgba(115,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(115,0,0,0.15)"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 250,
                      height: 350,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #730000 0%, #350404 100%)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      boxSizing: "border-box",
                      color: "#D4AF37",
                      textAlign: "center"
                    }}>
                      <span style={{ fontSize: 44, marginBottom: 12 }}>📖</span>
                      <span style={{ fontWeight: 800, fontSize: 16, color: "#FAF5EF" }}>{activeBook.title}</span>
                    </div>
                  )}
                </div>

                {/* Next Arrow */}
                <button
                  onClick={handleNextBook}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(115,0,0,0.1)",
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#730000",
                    fontSize: "18px",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                  title="Next Book"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAF5EF"; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  →
                </button>
              </div>

              {/* Book pagination indicator */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "#aa7c11", background: "rgba(212,175,55,0.08)", padding: "6px 14px", borderRadius: 20 }}>
                Free Title {activeIndex + 1} of {freeBooks.length}
              </div>
            </div>

            {/* Right Column: Title & Content */}
            <div style={{ 
              background: "#ffffff", 
              padding: "40px", 
              borderRadius: 20, 
              boxShadow: "0 10px 30px rgba(0,0,0,0.02)", 
              border: "1.5px solid rgba(115,0,0,0.05)", 
              display: "flex", 
              flexDirection: "column" 
            }}>
              
              {/* Category info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ background: "#FAF5EF", color: "#D4AF37", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5, border: "1px solid rgba(212,175,55,0.2)" }}>
                  {activeBook.genre}
                </span>
                <span style={{ fontSize: 12, color: "#aa7c11", fontWeight: 700 }}>
                  by {activeBook.author}
                </span>
              </div>

              {/* Book Title */}
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(26px, 3.2vw, 32px)",
                fontWeight: 900,
                color: "#730000",
                marginBottom: 20,
                lineHeight: 1.2
              }}>
                {activeBook.title}
              </h1>

              {/* Chapter Selection Panel */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderBottom: "1.5px solid rgba(115,0,0,0.06)", paddingBottom: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#5C3A21", textTransform: "uppercase", letterSpacing: 0.5 }}>Chapter:</span>
                  <select
                    value={currentChapter}
                    onChange={(e) => {
                      setCurrentChapter(Number(e.target.value));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1.5px solid rgba(115,0,0,0.12)",
                      background: "#FAF5EF",
                      color: "#730000",
                      fontWeight: 700,
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    {chapters.map((ch, idx) => (
                      <option key={idx} value={idx}>{ch.title}</option>
                    ))}
                  </select>
                </div>
                
                <span style={{ fontSize: 12, color: "#8b6e56", fontWeight: 700 }}>
                  {currentChapter + 1} of {chapters.length} Chapters
                </span>
              </div>

              {/* Text content area */}
              <div style={{ minHeight: "260px" }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#aa7c11",
                  marginBottom: 16
                }}>
                  {currentChapterData.title}
                </h3>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "17px",
                  lineHeight: 1.8,
                  color: "#2D1B10",
                  textAlign: "justify",
                  whiteSpace: "pre-line",
                  letterSpacing: "0.2px"
                }}>
                  {currentChapterData.content}
                </div>
              </div>

              {/* Chapter pagination buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 20, borderTop: "1.5px solid rgba(115,0,0,0.06)" }}>
                <button
                  disabled={currentChapter === 0}
                  onClick={() => {
                    setCurrentChapter(c => c - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1.5px solid rgba(115,0,0,0.15)",
                    background: "transparent",
                    color: currentChapter === 0 ? "#cbd5e1" : "#730000",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: currentChapter === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (currentChapter > 0) e.currentTarget.style.background = "#FAF5EF"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  ← Previous Chapter
                </button>
                <button
                  disabled={currentChapter === chapters.length - 1}
                  onClick={() => {
                    setCurrentChapter(c => c + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1.5px solid #730000",
                    background: currentChapter === chapters.length - 1 ? "#cbd5e1" : "#730000",
                    color: currentChapter === chapters.length - 1 ? "#94a3b8" : "#ffffff",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: currentChapter === chapters.length - 1 ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (currentChapter < chapters.length - 1) e.currentTarget.style.background = "#550000"; }}
                  onMouseLeave={(e) => { if (currentChapter < chapters.length - 1) e.currentTarget.style.background = "#730000"; }}
                >
                  Next Chapter →
                </button>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media(max-width: 768px) {
          .reader-slider-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
