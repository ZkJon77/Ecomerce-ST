"use client"
import React from "react"
import { Package, Check } from "lucide-react"
import { KITS } from "@/lib/constants"

// Assuming fmt is provided or we define it here
const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

const KitsPage = ({ onAddKit }: { onAddKit: (name: string, price: number) => void }) => (
  <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
    <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2d3a8c 100%)", padding: "32px 32px 28px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
        <Package size={26} color="#fbbf24" />
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", margin: 0 }}>Kits de Pintura</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, marginTop: 4 }}>Kits completos para cada ambiente. Economize e comece a pintar hoje!</p>
        </div>
      </div>
    </div>
    <div style={{ padding: "24px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
      {KITS.map(kit => {
        const discount = Math.round((1 - kit.price / kit.originalPrice) * 100)
        return (
          <div key={kit.id} style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
            <div style={{ background: kit.color, padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 42 }}>{kit.icon}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{kit.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{kit.description}</div>
              </div>
              <div style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 800, color: "white" }}>
                -{discount}%
              </div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Inclui:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {kit.items.map(item => (
                    <span key={item} style={{ background: "#f0f4ff", color: "#1a1464", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                      <Check size={10} /> {item}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#999", textDecoration: "line-through" }}>{fmt(kit.originalPrice)}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1464" }}>{fmt(kit.price)}</div>
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>ou 6x de {fmt(kit.price / 6)} s/juros</div>
                </div>
                <button onClick={() => onAddKit(kit.name, kit.price)}
                  style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 10, padding: "14px 22px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                  Adicionar Kit
                </button>
              </div>
            </div>
          </div>
        )
      })}
      </div>
    </div>
  </div>
)

export default KitsPage
