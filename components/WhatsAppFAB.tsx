"use client"
import React from "react"
import { MessageCircle } from "lucide-react"

const WhatsAppFAB = () => (
  <a href="https://wa.me/551932660789?text=Olá! Gostaria de mais informações."
    target="_blank" rel="noreferrer"
    style={{ position: "fixed", bottom: 20, right: 16, width: 52, height: 52, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,211,102,0.5)", zIndex: 200, textDecoration: "none" }}>
    <MessageCircle size={26} color="white" fill="white" />
  </a>
)

export default WhatsAppFAB
