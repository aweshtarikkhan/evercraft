import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Page, Book } from "../types";
import { Stars, Disc, BookCoverSVG, NotifyMeButton } from "../components/common/UIComponents";
import { SEO } from "../components/common/SEO";
import { Breadcrumbs } from "../components/common/Breadcrumbs";
import { WordReveal } from "../components/common/WordReveal";

export function BookPage({ book, addToCart, go }: { book: Book; addToCart: (b: Book) => void; go: (p: Page) => void; }) {
  const [tab, setTab] = useState<"description" | "details">("description");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = "none";
      scrollRef.current.style.cursor = "grabbing";
      startX.current = "touches" in e ? e.touches[0].pageX : e.pageX;
      scrollLeft.current = scrollRef.current.scrollLeft;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = "x mandatory";
      scrollRef.current.style.cursor = "grab";
      const currentScroll = scrollRef.current.scrollLeft;
      const snapIndex = Math.round(currentScroll / 240);
      scrollRef.current.scrollTo({ left: snapIndex * 240, behavior: "smooth" });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    if (!("touches" in e)) e.preventDefault(); // Sirf mouse drag pe text selection prevent karein
    const currentX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const walk = (currentX - startX.current) * 1.5; // swipe ki speed
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };
  
  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      <SEO 
        title={book.title} 
        description={book.description?.substring(0, 160) || `Buy ${book.title} by ${book.author} at EverCraft Publications.`}
        image={book.coverUrl || book.cover_image}
      />
      <div style={{ background: "#FAF5EF", borderBottom: "1.5px solid rgba(115, 0, 0, 0.15)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 8, fontSize: 14, color: "#730000" }}>
          <Breadcrumbs items={[
            { title: 'Bookstore', path: '/shop' },
            { title: book.title, path: `/book/${book.id}` }
          ]} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 40, alignItems: "start" }} className="book-det-grid">
        {/* Left */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}
        >
          <div style={{ background: "#730000", border: "1px solid #D4AF37", borderRadius: 20, padding: 40, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
            <div
              className="book-cover-scroll"
              ref={scrollRef}
              onMouseDown={handleDragStart}
              onMouseLeave={handleDragEnd}
              onMouseUp={handleDragEnd}
              onMouseMove={handleDragMove}
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
              onTouchMove={handleDragMove}
              style={{ display: "flex", gap: 40, overflowX: "auto", width: 240, boxSizing: "border-box", padding: "20px", scrollSnapType: "x mandatory", scrollBehavior: "smooth", cursor: "grab" }}
            >
              <div style={{ position: "relative", flex: "0 0 200px", scrollSnapAlign: "center" }}>
                <BookCoverSVG src={book.frontCover} width={200} height={280} />
                {book.is_upcoming ? (
                  <div style={{ position: "absolute", top: -10, right: -10, background: "#D4AF37", color: "#2D1B10", fontWeight: 800, fontSize: 12, padding: "6px 14px", borderRadius: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>UPCOMING</div>
                ) : book.badge ? (
                  <div style={{ position: "absolute", top: -10, right: -10, background: "#D4AF37", color: "#550000", fontWeight: 800, fontSize: 12, padding: "6px 14px", borderRadius: 20 }}>{book.badge}</div>
                ) : null}
              </div>
              {book.backCover && (
                <div style={{ position: "relative", flex: "0 0 200px", scrollSnapAlign: "center" }}>
                  <BookCoverSVG src={book.backCover} width={200} height={280} />
                </div>
              )}
            </div>
            {book.backCover && <div className="animate-pulse" style={{ color: "#F3E5AB", fontSize: 13, marginTop: 8, fontWeight: 600 }}>Swipe to see back cover 👉</div>}
          </div>
           <div style={{ display: "flex", gap: 12, width: "100%" }}>
            {book.amazonLink && (
              <a href={book.amazonLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#f97316", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>📦 Amazon</a>
            )}
            {book.flipkartLink && (
              <a href={book.flipkartLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2563eb", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>🛍️ Flipkart</a>
            )}
            {book.ondcLink && (
              <a href={book.ondcLink} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#2563eb", color: "#fff", padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>🌐 ONDC</a>
            )}
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(115, 0, 0, 0.08)", color: "#730000", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1, border: "1px solid rgba(115, 0, 0, 0.15)" }}>{book.genre}</span>
            {book.is_upcoming ? (
              <span style={{ background: "#FAF5EF", color: "#aa7c11", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(212,175,55,0.3)" }}>
                ⏳ Upcoming Release: {book.release_date || "Coming Soon"}
              </span>
            ) : (
              <span style={{ background: book.available ? "#dcfce7" : "#fee2e2", color: book.available ? "#16a34a" : "#dc2626", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                {book.available ? `✅ In Stock: ${book.stock ?? 0}` : "❌ Out of Stock"}
              </span>
            )}
            <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{book.language}</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: "#730000", marginBottom: 6, lineHeight: 1.2, fontFamily: "'Playfair Display', Georgia, serif" }}>
            <WordReveal text={book.title} once={true} />
          </h1>
          {book.titleHindi && book.titleHindi !== book.title && <h2 style={{ fontSize: 20, color: "#aa7c11", fontWeight: 700, marginBottom: 10 }}>{book.titleHindi}</h2>}
          <p style={{ color: "#78716c", fontSize: 16, marginBottom: 20 }}>by <strong style={{ color: "#2D1B10", fontSize: 18 }}>{book.author}</strong> {book.authorHindi !== book.author && <span style={{ color: "#aa7c11" }}>({book.authorHindi})</span>}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "#ffffff", padding: "12px 16px", borderRadius: 12, border: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
            <Stars rating={book.rating} size={20} />
            <strong style={{ color: "#aa7c11", fontSize: 18 }}>{book.rating}/5</strong>
            <span style={{ color: "#5C3A21", fontSize: 14 }}>{book.reviews} verified reviews</span>
          </div>

          {book.is_upcoming ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#aa7c11" }}>Coming Soon</span>
            </div>
          ) : book.price === 0 ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: "#059669" }}>FREE BOOK</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: "#730000" }}>₹{book.price}</span>
              <span style={{ fontSize: 22, color: "#9ca3af", textDecoration: "line-through" }}>₹{book.mrp}</span>
              <span style={{ background: "#fef2f2", color: "#dc2626", fontWeight: 700, padding: "5px 12px", borderRadius: 20, fontSize: 13 }}>Save ₹{book.mrp - book.price} ({Math.round(((book.mrp - book.price) / book.mrp) * 100)}% OFF)</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 14, marginBottom: 32 }}>
            {book.is_upcoming ? (
              <div style={{ display: "flex", gap: 12 }}>
                <NotifyMeButton bookId={book.id} className="btn-primary" style={{ flex: 1, padding: "15px 20px", fontSize: 15, background: "#730000", color: "#fff", border: "none" }} />
                <button style={{ flex: 1, background: "transparent", color: "#730000", border: "2px solid #730000", borderRadius: 12, padding: "15px 20px", fontWeight: 800, cursor: "pointer", fontSize: 15, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#730000"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#730000"; }}>💖 Wishlist</button>
              </div>
            ) : book.price === 0 ? (
              <Link to={`/read/${book.id}`} className="btn-primary" style={{ padding: "15px 20px", fontSize: 15, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", background: "#059669" }}>📖 Read Now for Free</Link>
            ) : (
              <>
                <button className="btn-primary" style={{ flex: 1, padding: "15px 20px", fontSize: 15 }} onClick={() => addToCart(book)}>🛒 Add to Cart</button>
                <button onClick={() => { addToCart(book); go("cart"); }} style={{ flex: 1, background: "transparent", color: "#730000", border: "2px solid #730000", borderRadius: 12, padding: "15px 20px", fontWeight: 800, cursor: "pointer", fontSize: 15, transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#730000"; e.currentTarget.style.color = "#ffffff"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#730000"; }}>⚡ Buy Now</button>
              </>
            )}
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: "2px solid #e5e7eb", display: "flex", gap: 0, marginBottom: 20 }}>
            {(["description","details"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === t ? "3px solid #730000" : "3px solid transparent", color: tab === t ? "#730000" : "#9ca3af", fontWeight: 700, cursor: "pointer", textTransform: "capitalize", fontSize: 14, transition: "all 0.2s", marginBottom: -2 }}>{t}</button>
            ))}
          </div>

          {tab === "description" && (
            <div>
              <p style={{ color: "#2D1B10", lineHeight: 1.8, marginBottom: 16 }}>{book.description}</p>
              <div style={{ background: "#ffffff", border: "1.5px solid rgba(115, 0, 0, 0.15)", borderRadius: 12, padding: 16, color: "#2D1B10", lineHeight: 1.8, fontSize: 14 }}>{book.descriptionHindi}</div>
            </div>
          )}
          {tab === "details" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Author", book.author],
                ["Language", book.language],
                book.pages ? ["Pages", `${book.pages} pages`] : null,
                book.isbn ? ["ISBN", book.isbn] : null,
                ["Genre", book.genre],
                book.publisher ? ["Publisher", book.publisher] : null,
                ["Format", "Paperback"],
                ["Availability", "India-wide"]
              ]
                .filter((item): item is [string, string] => item !== null && item[1] !== undefined && item[1] !== "")
                .map(([k, v]) => (
                  <div key={k} style={{ background: "#ffffff", borderRadius: 10, padding: "12px 14px", border: "1.5px solid rgba(115, 0, 0, 0.15)" }}>
                    <div style={{ fontSize: 11, color: "#730000", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontWeight: 700, color: "#2D1B10", fontSize: 14 }}>{v}</div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      </div>
      <style>{`
        .book-det-grid { @media(max-width:768px){grid-template-columns:1fr!important;} }
        .book-cover-scroll::-webkit-scrollbar { display: none; }
        .book-cover-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}