"use client"
import React from "react"
import { BRANDS } from "@/lib/constants"

const BrandsSection = () => (
  <div style={{ background: "white", padding: "20px 16px 24px" }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 16, color: "#222", letterSpacing: 1, textTransform: "uppercase" }}>Procure por Marcas</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {BRANDS.map(brand => (
        <div key={brand.name} style={{ border: "1px solid #e5e7eb", borderRadius: 8, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", cursor: "pointer", background: "white" }}>
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} style={{ maxHeight: 30, maxWidth: "100%", objectFit: "contain" }}
              onError={e => { const img = e.target as HTMLImageElement; img.style.display = "none"; const s = img.nextSibling as HTMLElement | null; if (s) s.style.display = "block" }} />
          ) : null}
          <span style={{ fontSize: 11, fontWeight: 700, color: "#333", display: brand.logo ? "none" : "block" }}>{brand.name}</span>
        </div>
      ))}
    </div>
  </div>
)

export default BrandsSection
