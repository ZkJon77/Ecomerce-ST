"use client"
import React from "react"
import { MessageCircle, Instagram, Facebook } from "lucide-react"

const Footer = () => (
  <footer style={{ background: "#0f0c38", color: "white", padding: "24px 16px 16px" }}>
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 28, color: "white" }}>Silver</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Qualidade que você confia</div>
    </div>
    <div style={{ display: "flex", gap: 14, margin: "14px 0" }}>
      <a href="https://wa.me/551932660789?text=Olá! Gostaria de mais informações."
        target="_blank" rel="noreferrer"
        style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textDecoration: "none" }}>
        <MessageCircle size={16} color="white" />
      </a>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Instagram size={16} color="white" />
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <Facebook size={16} color="white" />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Institucional</div>
        {["Sobre nós", "Loja", "Contato"].map(l => (<div key={l} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, cursor: "pointer" }}>{l}</div>))}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Atendimento</div>
        {["Central de ajuda", "Política de trocas", "Envio e entregas"].map(l => (<div key={l} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 5, cursor: "pointer" }}>{l}</div>))}
      </div>
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
      © 2026 Silver Tintas · Av. Arymana, 299B · Campinas – SP · (19) 3266-0789
    </div>
  </footer>
)

export default Footer
