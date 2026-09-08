"use client"
import React from "react"
import { CATEGORIES } from "@/lib/constants"

const CategorySection = ({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) => (
  <div style={{ background: "white", padding: "20px 16px" }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Categorias</h2>
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {CATEGORIES.map(cat => (
        <button key={cat.name} onClick={() => onCategoryClick(cat.name)}
          style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "1px solid #d1d5db", background: "white", color: "#555", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  </div>
)

export default CategorySection
