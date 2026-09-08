"use client"
import React, { useState } from "react"
import { Paintbrush, Check } from "lucide-react"

const ColorPage = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const handleSearch = () => {
    if (!code) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setResult("Cor encontrada para " + code + ": Preto Metálico") }, 1200)
  }
  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2a52be 100%)", borderRadius: 12, padding: "20px 16px", marginBottom: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Paintbrush size={24} color="#fbbf24" />
          <div style={{ fontSize: 18, fontWeight: 800 }}>Consultar Cor</div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Digite o código da peça do veículo para encontrar a tinta correta.</p>
      </div>
      <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Código da cor</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: NH731P"
            style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <button onClick={handleSearch} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "..." : "Buscar"}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 12, padding: 12, background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 8, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={18} /> {result}
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorPage
