"use client"
import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { HERO_SLIDES } from "@/lib/constants"

const HeroCarousel = () => {
  const [idx, setIdx] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      handleSlideChange((idx + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(t)
  }, [idx])

  const handleSlideChange = (nextIdx: number) => {
    setFade(false)
    setTimeout(() => {
      setIdx(nextIdx)
      setImgError(false)
      setFade(true)
    }, 300)
  }

  const slide = HERO_SLIDES[idx]

  return (
    <div style={{
      position: "relative",
      background: slide.bg,
      overflow: "hidden",
      minHeight: 450,
      display: "flex",
      alignItems: "center",
      transition: "background 0.8s ease",
      color: "white"
    }}>
      {/* Background Image Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${slide.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.8s ease",
        zIndex: 0
      }} />

      {/* Dynamic Background Overlay for Contrast */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(135deg, ${slide.bg} 20%, rgba(0,0,0,0.6) 100%)`,
        zIndex: 1
      }} />

      {/* Decorative circles for modern look */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -100, right: -100, zIndex: 1 }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)", bottom: -50, left: -50, zIndex: 1 }} />

      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        width: "100%",
        padding: "40px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 2,
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.5s ease"
      }}>
        <div style={{ flex: 1, maxWidth: 600 }}>
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            background: "rgba(251,191,36,0.2)",
            border: "1px solid #fbbf24",
            borderRadius: 20,
            fontSize: 12,
            color: "#fbbf24",
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 16
          }}>
            {slide.brand}
          </div >
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            marginBottom: 16,
            textShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            {slide.title}
          </h1>
          <p style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            marginTop: 0,
            marginBottom: 32,
            maxWidth: 500,
            lineHeight: 1.5
          }}>
            {slide.sub}
          </p>
          <button
            onClick={() => window.location.href = "/produtos"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fbbf24",
              color: "#1a1464",
              border: "none",
              borderRadius: 30,
              padding: "16px 32px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(251,191,36,0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Ver Produtos <ArrowRight size={20} />
          </button>
        </div >

        <div style={{
          padding: "20px",
          width: 320,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
          {!imgError ? (
            <img
              key={idx}
              src={slide.image}
              alt={slide.title}
              onError={() => setImgError(true)}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.5))",
                animation: "float 4s ease-in-out infinite"
              }}
            />
          ) : (
            <div style={{
              width: 220, height: 260, borderRadius: 24, background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96,
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {slide.fallback}
            </div >
          )}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div >
      </div >

      <button onClick={() => handleSlideChange((idx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3, backdropFilter: "blur(4px)", transition: "background 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
      >
        <ChevronLeft size={24} color="white" />
      </button>
      <button onClick={() => handleSlideChange((idx + 1) % HERO_SLIDES.length)}
        style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3, backdropFilter: "blur(4px)", transition: "background 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
      >
        <ChevronRight size={24} color="white" />
      </button>

      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, zIndex: 3 }}>
        {HERO_SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => handleSlideChange(i)}
            style={{
              width: i === idx ? 32 : 10,
              height: 10,
              borderRadius: 5,
              background: i === idx ? "#fbbf24" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ))}
      </div >
    </div >
  )
}

export default HeroCarousel
