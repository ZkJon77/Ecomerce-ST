"use client"
import React, { useState } from "react"
import { Truck } from "lucide-react"

const DeliveryPage = () => {
  const [mode, setMode] = useState<"delivery" | "pickup" | null>(null)
  const [cep, setCep] = useState("")
  const [result, setResult] = useState<{ days: number; price: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDelivery = () => {
    if (cep.length < 8) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResult({ days: 2, price: cep.startsWith("130") ? "Grátis" : "R$ 24,90" })
    }, 1200)
  }

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Truck size={22} color="#e9d5ff" />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Entrega & Retirada</h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0 }}>Entregamos em toda Campinas e região. Ou retire na loja!</p>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { id: "delivery" as const, icon: "🚚", title: "Entrega em Casa", desc: "Receba no conforto do seu lar" },
            { id: "pickup" as const, icon: "🏪", title: "Retire na Loja", desc: "Pronto em até 2 horas" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setMode(opt.id)}
              style={{ background: mode === opt.id ? "#1a1464" : "white", border: mode === opt.id ? "none" : "1px solid #e5e7eb", borderRadius: 12, padding: "16px 12px", cursor: "pointer", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: mode === opt.id ? "white" : "#1a1464", marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 10, color: mode === opt.id ? "rgba(255,255,255,0.7)" : "#888" }}>{opt.desc}</div>
            </button>
          ))}
        </div>
        {mode === "delivery" && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Calcule o frete</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={cep} onChange={e => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="CEP (ex: 13056000)"
                style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              <button onClick={checkDelivery}
                style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {loading ? "..." : "OK"}
              </button>
            </div>
            {result && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📅</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>{result.days} dias úteis</div>
                  <div style={{ fontSize: 10, color: "#666" }}>Prazo estimado</div>
                </div>
                <div style={{ background: result.price === "Grátis" ? "#f0fdf4" : "#fff7ed", border: "1px solid " + (result.price === "Grátis" ? "#86efac" : "#fed7aa"), borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{result.price === "Grátis" ? "🎉" : "💳"}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>{result.price}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>Frete</div>
                </div>
              </div>
            )}
          </div>
        )}
        {mode === "pickup" && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Nossa loja</h3>
            <div style={{ background: "#f0f4ff", borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1464", marginBottom: 4 }}>Silver Tintas</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                Av. Arymana, 299B<br />
                Parque Universitário de Viracopos<br />
                Campinas – SP, 13056-464
              </div>
              <div style={{ fontSize: 12, color: "#1a1464", fontWeight: 600, marginTop: 6 }}>📞 (19) 3266-0789</div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#78350f" }}>
              ⏱️ Pedido pronto para retirada em até 2 horas após confirmação.
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🚚", title: "Frete Grátis", desc: "Compras acima de R$ 400 em Campinas" },
            { icon: "📦", title: "Embalagem", desc: "Produtos 100% seguros para transporte" },
            { icon: "🔄", title: "Troca fácil", desc: "7 dias para troca ou devolução" },
            { icon: "💳", title: "Parcelamento", desc: "Até 6x sem juros no cartão" },
          ].map(item => (
            <div key={item.title} style={{ background: "white", borderRadius: 10, padding: "12px 10px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1464", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeliveryPage
