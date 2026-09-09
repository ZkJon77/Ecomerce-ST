"use client"
import React from "react"
import { CATEGORIES } from "@/lib/constants"

const CategoriesGrid = ({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) => (
  <div style={{ background: "white", padding: "32px 32px 40px" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
    <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 20, color: "#222" }}>O que procura?</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, maxWidth: 700, margin: "0 auto" }}>
      {CATEGORIES.map(cat => (
        <div key={cat.name} onClick={() => onCategoryClick(cat.name)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#e8ecf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            transition: "background 0.2s",
          }}>
            <span style={{ fontSize: 28, lineHeight: 1, display: "block" }}>{cat.icon}</span>
          </div>
          <span style={{ fontSize: 11, color: "#444", textAlign: "center", fontWeight: 600, textTransform: "uppercase", lineHeight: 1.2 }}>{cat.name}</span>
        </div>
      ))}
    </div>
    </div>
  </div>
)

export default CategoriesGrid
