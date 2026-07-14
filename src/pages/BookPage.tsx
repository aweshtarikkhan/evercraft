import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Page, Book } from "../types";
import { Stars, Disc, BookCoverSVG, NotifyMeButton } from "../components/common/UIComponents";
import { SEO } from "../components/common/SEO";
import { Breadcrumbs } from "../components/common/Breadcrumbs";

export function BookPage({ book, addToCart, go, wishlist, toggleWishlist }: { 
  book: Book; 
  addToCart: (b: Book) => void; 
  go: (p: Page) => void; 
  wishlist: number[]; 
  toggleWishlist: (id: number) => void; 
}) {
  const [tab, setTab] = useState<"description" | "details">("description");
  const [coverIndex, setCoverIndex] = useState(0); // 0 = Front, 1 = Back

  const hasBackCover = !!book.backCover;
  const isWishlisted = wishlist.includes(book.id);

  // Auto calculate discount percentage
  const discountPct = book.mrp > book.price 
    ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
    : 0;

  const handlePrevCover = () => {
    if (hasBackCover) {
      setCoverIndex(prev => (prev === 0 ? 1 : 0));
    }
  };

  const handleNextCover = () => {
    if (hasBackCover) {
      setCoverIndex(prev => (prev === 0 ? 1 : 0));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0", paddingBottom: 60 }}>
      <SEO 
        title={`${book.title} by ${book.author} – Buy Online`}
        description={book.description?.substring(0, 155) || `Buy ${book.title} by ${book.author} at EverCraft Publications. Available on Amazon, Flipkart & direct delivery across India.`}
        keywords={`${book.title}, ${book.author}, buy ${book.title} online, ${book.genre} books India, EverCraft Publications books, ${book.language} books online`}
        image={book.frontCover}
        url={`https://www.evercraft.co.in/book/${book.slug}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          "name": book.title,
          "author": { "@type": "Person", "name": book.author },
          "isbn": book.isbn || undefined,
          "numberOfPages": book.pages || undefined,
          "inLanguage": book.language || "en",
          "genre": book.genre,
          "publisher": { "@type": "Organization", "name": book.publisher || "EverCraft Publication" },
          "image": book.frontCover,
          "url": `https://www.evercraft.co.in/book/${book.slug}`,
          "description": book.description?.substring(0, 200),
          "offers": book.price ? {
            "@type": "Offer",
            "price": book.price,
            "priceCurrency": "INR",
            "availability": book.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "EverCraft Publication" }
          } : undefined,
          "aggregateRating": book.rating ? {
            "@type": "AggregateRating",
            "ratingValue": book.rating,
            "reviewCount": book.reviews || 1
          } : undefined
        }}
      />

      {/* BREADCRUMBS STRIP */}
      <div style={{ background: "#FAF0E6", borderBottom: "1px solid rgba(115, 0, 0, 0.08)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center" }}>
          <Breadcrumbs items={[
            { title: 'Bookstore', path: '/shop' },
            { title: book.title, path: `/book/${book.slug}` }
          ]} />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr 280px", gap: 32, alignItems: "start" }} className="book-main-layout">
          
          {/* COLUMN 1: COVER SLIDER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              background: "linear-gradient(135deg, #7A0A0A 0%, #440000 100%)",
              borderRadius: 24,
              padding: "40px 20px 24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              boxShadow: "0 20px 40px rgba(115, 0, 0, 0.15)",
              overflow: "hidden",
              minHeight: 480
            }}
          >
            {/* Bestseller Ribbon */}
            {book.is_bestseller && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 24,
                background: "#D4AF37",
                color: "#550000",
                fontWeight: 900,
                fontSize: 10,
                padding: "12px 8px 16px 8px",
                borderRadius: "0 0 4px 4px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                writingMode: "vertical-rl",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                zIndex: 5
              }}>
                Best Seller
              </div>
            )}

            {/* Slider view */}
            <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
              {/* Prev Arrow */}
              {hasBackCover && (
                <button 
                  onClick={handlePrevCover} 
                  style={{
                    position: "absolute",
                    left: 0,
                    zIndex: 10,
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 18,
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s"
                  }}
                  className="arrow-btn"
                >
                  ‹
                </button>
              )}

              {/* Cover Image Wrapper */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={coverIndex}
                  initial={{ opacity: 0, x: coverIndex === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: coverIndex === 0 ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "flex", justifyContent: "center", width: "80%" }}
                >
                  <BookCoverSVG src={coverIndex === 0 ? book.frontCover : book.backCover} width={200} height={290} />
                </motion.div>
              </AnimatePresence>

              {/* Next Arrow */}
              {hasBackCover && (
                <button 
                  onClick={handleNextCover}
                  style={{
                    position: "absolute",
                    right: 0,
                    zIndex: 10,
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 18,
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s"
                  }}
                  className="arrow-btn"
                >
                  ›
                </button>
              )}
            </div>

            {/* Dots */}
            {hasBackCover && (
              <div style={{ display: "flex", gap: 8, margin: "20px 0 10px 0" }}>
                <span onClick={() => setCoverIndex(0)} style={{ width: 8, height: 8, borderRadius: "50%", background: coverIndex === 0 ? "#D4AF37" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s" }} />
                <span onClick={() => setCoverIndex(1)} style={{ width: 8, height: 8, borderRadius: "50%", background: coverIndex === 1 ? "#D4AF37" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s" }} />
              </div>
            )}

            {/* Swipe Instruction */}
            {hasBackCover && (
              <div style={{ color: "#F3E5AB", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Swipe to see back cover 👈
              </div>
            )}
          </motion.div>

          {/* COLUMN 2: BOOK DETAILS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {/* Badges strip */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ 
                background: "#FCE8E6", 
                color: "#A8201A", 
                fontSize: 11, 
                fontWeight: 800, 
                padding: "6px 14px", 
                borderRadius: 20, 
                textTransform: "uppercase", 
                letterSpacing: 1.2 
              }}>
                {book.genre}
              </span>
              
              {book.is_upcoming ? (
                <span style={{ background: "#FEF3C7", color: "#B45309", fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 20 }}>
                  ⏳ Upcoming Release
                </span>
              ) : (
                <span style={{ 
                  background: book.available ? "#D1FAE5" : "#FEE2E2", 
                  color: book.available ? "#065F46" : "#991B1B", 
                  fontSize: 11, 
                  fontWeight: 800, 
                  padding: "6px 14px", 
                  borderRadius: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  {book.available ? `✓ In Stock: ${book.stock ?? 0}` : "❌ Out of Stock"}
                </span>
              )}

              <span style={{ background: "#DBEAFE", color: "#1E40AF", fontSize: 11, fontWeight: 800, padding: "6px 14px", borderRadius: 20 }}>
                {book.language}
              </span>
            </div>

            {/* Book Title */}
            <h1 style={{ 
              fontSize: "clamp(28px, 3.5vw, 42px)", 
              fontWeight: 900, 
              color: "#3A0000", 
              marginBottom: 4, 
              lineHeight: 1.15, 
              fontFamily: "'Playfair Display', Georgia, serif" 
            }}>
              {book.title}
            </h1>

            {/* Hindi Title */}
            {book.titleHindi && book.titleHindi !== book.title && (
              <h2 style={{ 
                fontSize: 22, 
                color: "#C27D38", 
                fontWeight: 700, 
                marginBottom: 12,
                fontFamily: "inherit"
              }}>
                {book.titleHindi}
              </h2>
            )}

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <span style={{ color: "#78716C", fontSize: 15 }}>by</span>
              <strong style={{ color: "#2D1B10", fontSize: 17 }}>{book.author}</strong>
              {/* Verified Badge */}
              <span style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                background: "#D4AF37", 
                color: "#4A0000",
                borderRadius: "50%", 
                width: 18, 
                height: 18, 
                fontSize: 10,
                fontWeight: 900
              }} title="Verified Author">✓</span>
              {book.authorHindi && book.authorHindi !== book.author && (
                <span style={{ color: "#C27D38", fontSize: 15 }}>({book.authorHindi})</span>
              )}
            </div>

            {/* Rating Section */}
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 10, 
              marginBottom: 24, 
              background: "#ffffff", 
              padding: "10px 16px", 
              borderRadius: 12, 
              border: "1px solid rgba(115, 0, 0, 0.08)",
              alignSelf: "flex-start"
            }}>
              <Stars rating={book.rating} size={18} />
              <strong style={{ color: "#C27D38", fontSize: 16 }}>{book.rating}/5</strong>
              <span style={{ color: "#78716C", fontSize: 13, borderLeft: "1px solid #E5E5E5", paddingLeft: 10 }}>
                {book.reviews} verified reviews
              </span>
            </div>

            {/* Pricing Section */}
            {!book.is_upcoming && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: "#730000" }}>
                  ₹{book.price === 0 ? "Free" : book.price}
                </span>
                {book.price > 0 && book.mrp > book.price && (
                  <>
                    <span style={{ fontSize: 20, color: "#A8A29E", textDecoration: "line-through" }}>
                      ₹{book.mrp}
                    </span>
                    <span style={{ 
                      background: "#FCE8E6", 
                      color: "#A8201A", 
                      fontWeight: 800, 
                      padding: "4px 10px", 
                      borderRadius: 20, 
                      fontSize: 11 
                    }}>
                      Save ₹{book.mrp - book.price} ({discountPct}% OFF)
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
              {book.is_upcoming ? (
                <>
                  <NotifyMeButton bookId={book.id} className="btn-primary" style={{ flex: 1, padding: "16px 24px", fontSize: 15, background: "#730000", color: "#fff", border: "none", borderRadius: 12 }} />
                  <button 
                    onClick={() => toggleWishlist(book.id)} 
                    style={{ 
                      width: 52,
                      background: isWishlisted ? "#A8201A" : "#FCE8E6", 
                      color: isWishlisted ? "#ffffff" : "#A8201A", 
                      border: "none",
                      borderRadius: 12, 
                      cursor: "pointer", 
                      fontSize: 20, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      transition: "all 0.2s" 
                    }}
                    title="Toggle Wishlist"
                  >
                    {isWishlisted ? "❤️" : "🤍"}
                  </button>
                </>
              ) : book.price === 0 ? (
                <>
                  <Link 
                    to={`/read/${book.slug || book.id}`} 
                    className="btn-primary" 
                    style={{ 
                      flex: 1, 
                      padding: "16px 24px", 
                      fontSize: 15, 
                      textDecoration: "none", 
                      textAlign: "center", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      background: "#059669", 
                      borderRadius: 12 
                    }}
                  >
                    📖 Read Now for Free
                  </Link>
                  <button 
                    onClick={() => toggleWishlist(book.id)} 
                    style={{ 
                      width: 52,
                      background: isWishlisted ? "#A8201A" : "#FCE8E6", 
                      color: isWishlisted ? "#ffffff" : "#A8201A", 
                      border: "none",
                      borderRadius: 12, 
                      cursor: "pointer", 
                      fontSize: 20, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="Toggle Wishlist"
                  >
                    {isWishlisted ? "❤️" : "🤍"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: "16px 24px", fontSize: 15, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#C27D38", border: "none", color: "#fff" }} 
                    onClick={() => addToCart(book)}
                  >
                    🛒 Add to Cart
                  </button>
                  <button 
                    onClick={() => { addToCart(book); go("cart"); }} 
                    style={{ 
                      flex: 1, 
                      background: "#ffffff", 
                      color: "#A8201A", 
                      border: "2px solid #A8201A", 
                      borderRadius: 12, 
                      padding: "16px 24px", 
                      fontWeight: 800, 
                      cursor: "pointer", 
                      fontSize: 15, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: 8,
                      transition: "all 0.2s" 
                    }}
                  >
                    ⚡ Buy Now
                  </button>
                  <button 
                    onClick={() => toggleWishlist(book.id)} 
                    style={{ 
                      width: 52,
                      background: isWishlisted ? "#A8201A" : "#FCE8E6", 
                      color: isWishlisted ? "#ffffff" : "#A8201A", 
                      border: "none",
                      borderRadius: 12, 
                      cursor: "pointer", 
                      fontSize: 20, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                    title="Toggle Wishlist"
                  >
                    {isWishlisted ? "❤️" : "🤍"}
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* COLUMN 3: ALSO AVAILABLE ON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "#ffffff",
              border: "1.5px solid rgba(115, 0, 0, 0.08)",
              borderRadius: 20,
              padding: "24px 20px",
              boxShadow: "0 10px 30px rgba(115,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#A8201A", textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 4 }}>
                🛒 Also available on
              </span>
              <span style={{ flex: 1, height: 1, background: "#E5E5E5" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Amazon */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1px solid #F3F4F6", borderRadius: 12, padding: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "sans-serif" }}>amazon</span>
                <a 
                  href={book.amazonLink || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6, 
                    background: "rgba(194, 125, 56, 0.1)", 
                    color: "#C27D38", 
                    padding: "8px 12px", 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    fontSize: 12, 
                    textDecoration: "none",
                    textAlign: "center",
                    border: "1px solid rgba(194, 125, 56, 0.25)"
                  }}
                  className="shop-link"
                >
                  Shop on Amazon →
                </a>
              </div>

              {/* Flipkart */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1px solid #F3F4F6", borderRadius: 12, padding: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#2874F0", fontFamily: "sans-serif" }}>Flipkart</span>
                <a 
                  href={book.flipkartLink || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6, 
                    background: "rgba(40, 116, 240, 0.1)", 
                    color: "#2874F0", 
                    padding: "8px 12px", 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    fontSize: 12, 
                    textDecoration: "none",
                    textAlign: "center",
                    border: "1px solid rgba(40, 116, 240, 0.25)"
                  }}
                  className="shop-link"
                >
                  Shop on Flipkart →
                </a>
              </div>

              {/* ONDC */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1px solid #F3F4F6", borderRadius: 12, padding: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#005691", fontFamily: "sans-serif" }}>ONDC</span>
                <a 
                  href={book.ondcLink || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: 6, 
                    background: "rgba(0, 86, 145, 0.1)", 
                    color: "#005691", 
                    padding: "8px 12px", 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    fontSize: 12, 
                    textDecoration: "none",
                    textAlign: "center",
                    border: "1px solid rgba(0, 86, 145, 0.25)"
                  }}
                  className="shop-link"
                >
                  Shop on ONDC →
                </a>
              </div>
            </div>
          </motion.div>

        </div>

        {/* TABS & DESCRIPTION SECTION */}
        <div style={{ marginTop: 52 }}>
          {/* Tabs header */}
          <div style={{ borderBottom: "2px solid #E5E7EB", display: "flex", gap: 16, marginBottom: 28 }}>
            <button 
              onClick={() => setTab("description")} 
              style={{ 
                padding: "12px 24px", 
                background: "none", 
                border: "none", 
                borderBottom: tab === "description" ? "3px solid #730000" : "3px solid transparent", 
                color: tab === "description" ? "#730000" : "#A8A29E", 
                fontWeight: 800, 
                cursor: "pointer", 
                fontSize: 15, 
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: -2
              }}
            >
              📄 Description
            </button>
            <button 
              onClick={() => setTab("details")} 
              style={{ 
                padding: "12px 24px", 
                background: "none", 
                border: "none", 
                borderBottom: tab === "details" ? "3px solid #730000" : "3px solid transparent", 
                color: tab === "details" ? "#730000" : "#A8A29E", 
                fontWeight: 800, 
                cursor: "pointer", 
                fontSize: 15, 
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: -2
              }}
            >
              ℹ️ Details
            </button>
          </div>

          {/* Description Content */}
          {tab === "description" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="tab-desc-grid">
              {/* English Description */}
              <div style={{ color: "#44403C", lineHeight: 1.8, fontSize: 15 }}>
                {book.description}
              </div>
              {/* Hindi Description Card */}
              {book.descriptionHindi && (
                <div style={{ 
                  background: "#FFFBF7", 
                  borderLeft: "4px solid #A8201A", 
                  borderRadius: "0 16px 16px 0", 
                  padding: "24px 28px", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                  position: "relative"
                }}>
                  {/* Styled quote marks */}
                  <span style={{ 
                    position: "absolute", 
                    top: 10, 
                    left: 10, 
                    fontSize: 48, 
                    color: "rgba(168, 32, 26, 0.08)", 
                    fontFamily: "Georgia, serif",
                    fontWeight: 900
                  }}>“</span>
                  <p style={{ color: "#57534E", lineHeight: 1.8, fontSize: 15, margin: 0, fontStyle: "normal" }}>
                    {book.descriptionHindi}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Details Content */}
          {tab === "details" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
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
                  <div key={k} style={{ background: "#ffffff", borderRadius: 12, padding: "16px 18px", border: "1.5px solid rgba(115, 0, 0, 0.06)" }}>
                    <div style={{ fontSize: 11, color: "#A8201A", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, fontWeight: 800 }}>{k}</div>
                    <div style={{ fontWeight: 700, color: "#2D1B10", fontSize: 15 }}>{v}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* BOTTOM FEATURES STRIP */}
        <div style={{ 
          marginTop: 64, 
          borderTop: "1px solid #E5E5E5", 
          paddingTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20
        }} className="bottom-features">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 32 }}>🚚</span>
            <div>
              <strong style={{ display: "block", color: "#1C1917", fontSize: 15 }}>Free Delivery</strong>
              <span style={{ color: "#78716C", fontSize: 13 }}>On prepaid orders</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, borderLeft: "1px solid #E5E5E5", paddingLeft: 32 }} className="feature-border">
            <span style={{ fontSize: 32 }}>🔄</span>
            <div>
              <strong style={{ display: "block", color: "#1C1917", fontSize: 15 }}>7 Days Return</strong>
              <span style={{ color: "#78716C", fontSize: 13 }}>Easy return policy</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, borderLeft: "1px solid #E5E5E5", paddingLeft: 32 }} className="feature-border">
            <span style={{ fontSize: 32 }}>🔒</span>
            <div>
              <strong style={{ display: "block", color: "#1C1917", fontSize: 15 }}>Secure Payment</strong>
              <span style={{ color: "#78716C", fontSize: 13 }}>100% secure & safe checkout</span>
            </div>
          </div>
        </div>

      </div>

      {/* STYLES FOR RESPONSIVENESS */}
      <style>{`
        .book-main-layout {
          @media (max-width: 992px) {
            grid-template-columns: 1fr;
          }
        }
        .tab-desc-grid {
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
          }
        }
        .bottom-features {
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        .feature-border {
          @media (max-width: 768px) {
            border-left: none !important;
            padding-left: 0 !important;
          }
        }
        .arrow-btn:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }
        .shop-link:hover {
          background: rgba(0, 0, 0, 0.03) !important;
        }
      `}</style>
    </div>
  );
}