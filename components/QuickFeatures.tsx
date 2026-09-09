"use client"
import React from "react"
import { Calculator, Palette, Package, Truck } from "lucide-react"

const QuickFeatures = ({ setPage }: { setPage: (p: string) => void }) => (
  <div style={{ background: "#1a1464", padding: "16px 32px" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "flex-start", gap: 24 }}>
    {[
      { icon: <Calculator size={18} color="#fbbf24" />, label: "Calculadora", page: "calculadora" },
      { icon: <Palette size={18} color="#fbbf24" />, label: "Simulador", page: "simulador" },
      { icon: <Package size={18} color="#fbbf24" />, label: "Kits", page: "kits" },
      { icon: <Truck size={18} color="#fbbf24" />, label: "Entrega", page: "entrega" },
    ].map(item => (
      <button key={item.page} onClick={() => setPage(item.page)}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {item.icon}
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{item.label}</span>
      </button>
    ))}
    </div>
  </div>
)

export default QuickFeatures
