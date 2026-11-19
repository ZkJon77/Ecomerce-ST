"use client"
import React from "react"

const StoreBanner = () => (
  <div style={{ display: "flex", background: "#f7f8fc", overflow: "hidden", flexWrap: "wrap" }}>
    <div style={{ flex: "1 1 50%", minWidth: 0, minHeight: 180, background: "#1a88d4", position: "relative", overflow: "hidden" }}>
      <img
        src="/img/fachada-silver.webp"
        alt="Fachada da loja física Silver Tintas em Campinas"
        style={{ display: "block", width: "100%", height: "100%", minHeight: 180, objectFit: "cover", objectPosition: "center" }}
      />
    </div>
    <div style={{ flex: "1 1 50%", minWidth: 0, background: "#1a1464", padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 8, lineHeight: 1.2 }}>conheça nossa<br />loja física</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>Av. Arymana, 299B · Parque Universitário de Viracopos<br />Campinas – SP, 13056-464</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: 600 }}>Telefone: (19) 3266-0789</div>
    </div>
  </div>
)

export default StoreBanner
