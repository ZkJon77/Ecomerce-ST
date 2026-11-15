"use client"
import React from "react"
import { PaintBucket, Paintbrush, Droplets, SprayCan, Package } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"

const categoryIcons = {
  paint: PaintBucket,
  brush: Paintbrush,
  water: Droplets,
  spray: SprayCan,
  accessories: Package,
}

const CategoriesGrid = ({ onCategoryClick }) => (
  <div style={{ background: "white", padding: "32px 24px 40px" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 20, color: "#222" }}>O que procura?</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 16, maxWidth: 700, margin: "0 auto" }}>
        {CATEGORIES.map(cat => {
          const Icon = categoryIcons[cat.icon]
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onCategoryClick(cat.name)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", border: 0, background: "transparent", padding: 8 }}
            >
              <span style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#e8ecf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s, transform 0.2s",
              }}>
                <Icon size={26} strokeWidth={1.7} color="#1a1464" />
              </span>
              <span style={{ fontSize: 11, color: "#444", textAlign: "center", fontWeight: 600, textTransform: "uppercase", lineHeight: 1.2 }}>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  </div>
)

export default CategoriesGrid
