import React from "react";
import { motion } from "framer-motion";
import { Book } from "../types";
import { Stars, Disc, BookCoverSVG } from "../components/common/UIComponents";
import { TextMarquee } from "../components/common/TextMarquee";
import { WordReveal } from "../components/common/WordReveal";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

import { Link } from "react-router-dom";

export function ShopPage({ search, setSearch, filtered, addToCart, openBook }: {
  search: string; setSearch: (s: string) => void; filtered: Book[];
  addToCart: (b: Book) => void; openBook: (b: Book) => void;
}) {
  const [selectedGenre, setSelectedGenre] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("default");

  const genres = ["All", "Spirituality", "Self-Help", "Fiction", "Free Books"];

  const genreFiltered = filtered.filter(book => {
    if (selectedGenre === "All") return true;
    if (selectedGenre === "Free Books") return book.price === 0;
    return book.genre.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  const sortedBooks = [...genreFiltered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // default
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EF" }}>
      {/* HERO */}
      <div style={{ 
        background: "#ffffff", 
        minHeight: "45vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 24px",
        boxSizing: "border-box",
        borderBottom: "1px solid rgba(115, 0, 0, 0.05)"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", color: "#730000", width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid rgba(115, 0, 0, 0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, background: "rgba(115, 0, 0, 0.05)" }}>
              <span style={{ color: "#730000", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Book Shop</span>
            </div>
            <h1 style={{ fontSize: "clamp(38px,5.5vw,56px)", fontWeight: 800, marginBottom: 12, color: "#730000", fontFamily: "'Playfair Display', Georgia, serif" }}>
              <WordReveal text="Our Book *Collection*" once={true} />
            </h1>
            <p style={{ color: "#730000", opacity: 0.8, fontSize: 16, marginBottom: 32 }}>Discover wisdom, inspiration, and knowledge through our curated titles</p>
            <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search books, authors, genres..."
                style={{ width: "100%", padding: "14px 48px", borderRadius: 12, border: "1.5px solid rgba(115, 0, 0, 0.25)", fontSize: 15, outline: "none", boxShadow: "0 4px 20px rgba(115,0,0,0.05)", boxSizing: "border-box", color: "#730000", background: "#ffffff" }} />
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9ca3af" }}>✕</button>}
            </div>
          </motion.div>
        </div>
      </div>

      {/* MARQUEE */}
      <TextMarquee 
        items={["Top Rated Titles", "Free Books Available", "Bestsellers", "Spiritual Wisdom", "Self-Help guides", "Premium Editions"]}
        speed={25}
        bgColor="#D4AF37"
        textColor="#550000"
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* FILTERS & SORTING */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          {/* Genre Tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }} className="scroll-hide">
            {genres.map(g => (
              <button 
                key={g} 
                onClick={() => setSelectedGenre(g)} 
                className={`genre-tab ${selectedGenre === g ? "active" : ""}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#730000", fontWeight: 600 }}>Sort By:</span>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid rgba(115, 0, 0, 0.2)", background: "#ffffff", fontSize: 13, fontWeight: 600, color: "#730000" }}
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <p style={{ color: "#730000", opacity: 0.8, fontWeight: 600 }}>{sortedBooks.length} book{sortedBooks.length !== 1 ? "s" : ""} found</p>
          <span style={{ background: "#ffffff", color: "#D4AF37", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(212, 175, 55, 0.3)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>📚 More Coming Soon!</span>
        </div>

        {sortedBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#730000", marginBottom: 8 }}>No books found</h3>
            <p style={{ color: "#5c5c5c", marginBottom: 16 }}>Try selecting a different filter or search term</p>
            <button onClick={() => { setSearch(""); setSelectedGenre("All"); }} style={{ color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>Reset Filters</button>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} 
            className="shop-grid"
          >
            {sortedBooks.map(book => (
              <motion.div 
                variants={fadeInUp}
                key={book.id} 
                className="card-hover" 
                style={{ background: "#ffffff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1.5px solid rgba(115, 0, 0, 0.08)", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ background: "#730000", padding: "28px 20px", display: "flex", justifyContent: "center", cursor: "pointer", position: "relative" }} onClick={() => openBook(book)}>
                    <div style={{ position: "relative" }}>
                      <BookCoverSVG src={book.frontCover} width={130} height={182} />
                      {book.is_upcoming ? (
                        <div style={{ position: "absolute", top: -8, right: -8, background: "#D4AF37", color: "#2D1B10", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>UPCOMING</div>
                      ) : book.price === 0 ? (
                        <div style={{ position: "absolute", top: -8, right: -8, background: "#059669", color: "#ffffff", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>FREE BOOK</div>
                      ) : (book.badge && book.badge !== "none" && book.badge !== "") ? (
                        <div style={{ position: "absolute", top: -8, right: -8, background: "#D4AF37", color: "#550000", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20 }}>{book.badge}</div>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3 style={{ fontWeight: 800, color: "#730000", fontSize: 15, lineHeight: 1.3, marginBottom: 4, height: 40, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{book.title}</h3>
                    {book.titleHindi && book.titleHindi !== book.title ? (
                      <p style={{ fontSize: 12, color: "#D4AF37", marginBottom: 8, height: 18, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.titleHindi}</p>
                    ) : (
                      <div style={{ height: 26 }} />
                    )}
                    <p style={{ fontSize: 13, color: "#5c5c5c", marginBottom: 8 }}>by <strong style={{ color: "#730000" }}>{book.author}</strong></p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                      <Stars rating={book.rating} size={14} />
                      <span style={{ fontSize: 12, color: "#5c5c5c" }}>({book.reviews})</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "0 18px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, minHeight: 28 }}>
                    {book.is_upcoming ? (
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#aa7c11" }}>⏳ {book.release_date || "Coming Soon"}</span>
                    ) : book.price === 0 ? (
                      <span style={{ fontSize: 20, fontWeight: 900, color: "#059669" }}>FREE</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 20, fontWeight: 900, color: "#730000" }}>₹{book.price}</span>
                        <span style={{ fontSize: 13, color: "#5c5c5c", textDecoration: "line-through" }}>₹{book.mrp}</span>
                        <Disc pct={Math.round(((book.mrp - book.price) / book.mrp) * 100)} />
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {book.is_upcoming ? (
                      <button onClick={() => openBook(book)} className="btn-primary" style={{ flex: 1, padding: "10px 8px", fontSize: 13 }}>📖 View Details</button>
                    ) : book.price === 0 ? (
                      <Link to={`/read/${book.id}`} className="btn-primary" style={{ flex: 1, padding: "10px 8px", fontSize: 13, textDecoration: "none", textAlign: "center", background: "#059669" }}>📖 Read Now</Link>
                    ) : (
                      <button onClick={() => addToCart(book)} className="btn-primary" style={{ flex: 1, padding: "10px 8px", fontSize: 13 }}>🛒 Add to Cart</button>
                    )}
                    {!book.is_upcoming && (
                      <button onClick={() => openBook(book)} style={{ padding: "10px 12px", border: "2px solid #730000", borderRadius: 8, background: "none", cursor: "pointer", fontSize: 14, color: "#730000", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(115,0,0,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>👁️</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Coming soon */}
            <motion.div 
              variants={fadeInUp}
              style={{ background: "#ffffff", borderRadius: 20, border: "2px dashed #D4AF37", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 320 }}
            >
              <div style={{ fontSize: 48, opacity: 0.4, marginBottom: 16 }}>📚</div>
              <h3 style={{ fontWeight: 700, color: "#730000", marginBottom: 8 }}>More Books Coming Soon</h3>
              <p style={{ color: "#5c5c5c", fontSize: 13, lineHeight: 1.6 }}>Stay tuned for our next exciting release!</p>
              <div style={{ marginTop: 14, background: "#FAF5EF", color: "#D4AF37", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(212,175,55,0.15)" }}>New Arrivals Every Month</div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <style>{`
        .shop-grid { @media(max-width:1024px){grid-template-columns:repeat(3,1fr)!important;} @media(max-width:768px){grid-template-columns:repeat(2,1fr)!important;} @media(max-width:480px){grid-template-columns:1fr!important;} }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}