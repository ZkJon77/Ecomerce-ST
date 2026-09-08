"use client"
import React from "react"
import { ChevronRight, Palette } from "lucide-react"

const ColorBanner = ({ setPage }: { setPage: (p: string) => void }) => (
  <div style={{ margin: "0 12px 16px", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f0f4ff", position: "relative" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "16px 14px", gap: 12 }}>
      <div style={{ width: 70, height: 70, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          {[
            { color: "#e53e3e", d: "M50,50 L50,10 A40,40 0 0,1 84,30 Z" },
            { color: "#ed8936", d: "M50,50 L84,30 A40,40 0 0,1 90,50 Z" },
            { color: "#ecc94b", d: "M50,50 L90,50 A40,40 0 0,1 84,70 Z" },
            { color: "#48bb78", d: "M50,50 L84,70 A40,40 0 0,1 50,90 Z" },
            { color: "#38b2ac", d: "M50,50 L50,90 A40,40 0 0,1 16,70 Z" },
            { color: "#4299e1", d: "M50,50 L16,70 A40,40 0 0,1 10,50 Z" },
            { color: "#805ad5", d: "M50,50 L10,50 A40,40 0 0,1 16,30 Z" },
            { color: "#e53e3e", d: "M50,50 L16,30 A40,40 0 0,1 50,10 Z" },
          ].map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
          <circle cx="50" cy="50" r="12" fill="white" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1464", lineHeight: 1.2, marginBottom: 4 }}>escolha a cor ideal para seu ambiente</div>
        <div style={{ fontSize: 10, color: "#666", marginBottom: 8 }}>Sua criatividade começa aqui, explore nossas cores.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage("cor")} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            Código <ChevronRight size={12} />
          </button>
          <button onClick={() => setPage("simulador")} style={{ background: "#6d28d9", color: "white", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            Simular <Palette size={10} />
          </button>
        </div>
      </div>
    </div>
    <div style={{ background: "#dbeafe", padding: "6px 14px", fontSize: 10, color: "#1e40af" }}>📸 @silverpintura</div>
  </div>
)

export default ColorBanner
