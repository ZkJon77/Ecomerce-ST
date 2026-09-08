"use client"
import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HERO_SLIDES } from "@/lib/constants"

const HeroCarousel = () => {
  const [idx, setIdx] = useState(0)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setImgError(false)
  }, [idx])

  const slide = HERO_SLIDES[idx]

  return (
    <div style={{ position: "relative", background: slide.bg, overflow: "hidden", minHeight: 340, display: "flex", alignItems: "center", transition: "background 0.5s" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, " + slide.bg + " 40%, rgba(255,255,255,0.05) 100%)" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%", padding: "40px 32px", display: "flex", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>{slide.brand}</div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{slide.title}</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>{slide.sub}</div>
        </div>
        <div style={{ padding: "10px 0", width: 210, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!imgError ? (
            <img
              key={idx}
              src={slide.image}
              alt={slide.title}
              onError={() => setImgError(true)}
              style={{ height: 260, width: 210, objectFit: "contain", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.4))" }}
            />
          ) : (
            <div style={{
              width: 180, height: 220, borderRadius: 16, background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72,
            }}>
              {slide.fallback}
            </div>
          )}
        </div>
      </div>
      <button onClick={() => setIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3 }}>
        <ChevronLeft size={16} color="white" />
      </button>
      <button onClick={() => setIdx(i => (i + 1) % HERO_SLIDES.length)}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3 }}>
        <ChevronRight size={16} color="white" />
      </button>
      <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7, zIndex: 3 }}>
        {HERO_SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 9,
              height: 9,
              borderRadius: 5,
              background: i === idx ? "#fbbf24" : "rgba(255,255,255,0.55)",
              border: i === idx ? "none" : "1px solid rgba(255,255,255,0.3)",
              boxShadow: i === idx ? "0 0 0 2px rgba(251,191,36,0.25)" : "none",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HeroCarousel
