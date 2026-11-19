"use client"
import React from "react"

const StoreBanner = () => (
  <div style={{ display: "flex", background: "#f7f8fc", overflow: "hidden", flexWrap: "wrap" }}>
    <div style={{ flex: "1 1 50%", minWidth: 0, height: 140, background: "#1a88d4", position: "relative", overflow: "hidden" }}>
      <img
        src="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TVdNibtA1qlziOKcey0LC3PqtGRpckoXyBcm-MSe_vGMNkO8I5O5meEm1YFsNBmT_XJ0sP5FbP1kwuhkiOA3V-3Y_vFLUdomG-xcNLKRlw0heBExzVZyodHM6ouAYXXdslZNc=s680-w680-h510-rw"
        alt="Fachada da loja física Silver Tintas em Campinas"
        style={{ display: "block", width: "100%", height: 140, objectFit: "cover", objectPosition: "center" }}
      />
    </div>
    <div style={{ flex: "1 1 50%", minWidth: 0, background: "#1a1464", padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 5, lineHeight: 1.15 }}>conheça nossa<br />loja física</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>Av. Arymana, 299B · Parque Universitário de Viracopos<br />Campinas – SP, 13056-464</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: 600 }}>Telefone: (19) 3266-0789</div>
    </div>
  </div>
)
export default StoreBanner
