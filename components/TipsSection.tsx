"use client"
import React from "react"
import { Zap } from "lucide-react"

const TipsSection = () => {
  const tips = [
    { icon: "🖌️", title: "Fosco, Acetinado ou Semibrilho?", desc: "Fosco esconde imperfeições; semibrilho é lavável; acetinado equilibra os dois." },
    { icon: "💧", title: "Áreas úmidas", desc: "Use tinta antimofo em banheiros e cozinhas. Sempre aplique selador antes." },
    { icon: "☀️", title: "Pintando fachadas", desc: "Escolha tintas com proteção UV para garantir durabilidade de 5+ anos." },
    { icon: "🧹", title: "Preparação é tudo", desc: "Lixe, aplique massa corrida e fundo preparador antes de pintar. O resultado faz diferença!" },
  ]
  return (
    <div style={{ background: "#1a1464", padding: "20px 16px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap size={18} color="#fbbf24" />
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0 }}>Dicas dos especialistas</h2>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {tips.map(tip => (
          <div key={tip.title} style={{ flexShrink: 0, width: 180, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "white", marginBottom: 6, lineHeight: 1.2 }}>{tip.title}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{tip.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TipsSection
