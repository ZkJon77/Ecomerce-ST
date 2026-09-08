"use client"
import React from "react"

const StoreBanner = () => (
  <div style={{ display: "flex", background: "#f7f8fc", overflow: "hidden" }}>
    <div style={{ flex: 1, minHeight: 140, background: "#1a88d4", position: "relative", overflow: "hidden" }}>
      <img src="https://lh5.googleusercontent.com/p/AF1QipME5Ys4k0HB0q2f4I1H3HlFEXVFhqNGTTNGMJg=w426-h240-k-no" alt="Loja Silver Tintas"
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
    </div>
    <div style={{ flex: 1.2, background: "#1a1464", padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.2 }}>conheça nossa<br />loja física</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>Av. Arymana, 299B · Parque Universitário de Viracopos<br />Campinas – SP, 13056-464</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: 600 }}>Telefone: (19) 3266-0789</div>
    </div>
  </div>
)

export default StoreBanner
