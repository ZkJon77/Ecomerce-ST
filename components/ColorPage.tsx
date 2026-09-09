"use client"
import React, { useState } from "react"
import { Paintbrush, Check, AlertCircle } from "lucide-react"

const COLOR_MAP: Record<string, { name: string, hex: string, description: string }> = {
  "NH731P": { name: "Prata Lunar", hex: "#BFC1C2", description: "Prata metálico clássico (Alabaster Silver) - Tonalidade equilibrada com reflexos metálicos frios." },
  "NH731": { name: "Prata Lunar", hex: "#BFC1C2", description: "Prata metálico clássico (Alabaster Silver) - Tonalidade equilibrada com reflexos metálicos frios." },
  "NH700P": { name: "Preto Cristal", hex: "#050505", description: "Preto profundo (Crystal Black Pearl) - Preto intenso com partículas de brilho cristalino." },
  "NH731S": { name: "Branco Pérola", hex: "#FDFDFD", description: "Branco sofisticado com reflexos perolados e profundidade." },
  "NH789P": { name: "Vermelho Rubi", hex: "#A52A2A", description: "Vermelho metálico vibrante - Tonalidade intensa para acabamentos esportivos." },
  "NH800P": { name: "Azul Metálico", hex: "#000080", description: "Azul escuro profundo com partículas metálicas sutis." },
  "NH900P": { name: "Verde Esmeralda", hex: "#2E8B57", description: "Verde metálico elegante com fundo profundo." },
  "NH123P": { name: "Amarelo Canário", hex: "#FFEF00", description: "Amarelo sólido vibrante e de alta visibilidade." },
  "NH444P": { name: "Cinza Grafite", hex: "#363636", description: "Cinza escuro moderno - Tonalidade sóbria e sofisticada." },
  "NH555P": { name: "Bege Champanhe", hex: "#E7D3B5", description: "Tonalidade creme metálica sofisticada." },
}

const ColorPage = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<{ name: string, hex: string, description: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    if (!code) return
    setLoading(true)
    setResult(null)

    setTimeout(() => {
      setLoading(false);
      const found = COLOR_MAP[code.toUpperCase()];
      if (found) {
        setResult(found);
      } else {
        setResult(null);
      }
    }, 1200)
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2a52be 100%)", borderRadius: 12, padding: "20px 16px", marginBottom: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Paintbrush size={24} color="#fbbf24" />
          <div style={{ fontSize: 18, fontWeight: 800 }}>Consultar Cor do Veículo</div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Digite o código de pintura encontrado na etiqueta do carro (porta, capô ou porta-malas) para simular o acerto de tinta.</p>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Código da cor (Ex: NH731P)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Digite o código aqui..."
            style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", fontWeight: 600 }} />
          <button onClick={handleSearch} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Buscando..." : "Buscar Cor"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 24, animation: "fadeIn 0.3s ease-in" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#166534", fontSize: 14, fontWeight: 700 }}>
              <Check size={18} /> Cor Localizada com Sucesso!
            </div>

            <div style={{ display: "flex", gap: 20, alignItems: "center", padding: 20, background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: 12,
                background: result.hex,
                border: "4px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                flexShrink: 0
              }}></div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1464", marginBottom: 4 }}>{result.name}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.4 }}>{result.description}</div>
                <div style={{ marginTop: 8, display: "inline-block", background: "#e5e7eb", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>
                  Código: {code.toUpperCase()}
                </div>
              </div>
            </div>
            <p style={{ marginTop: 12, fontSize: 11, color: "#999", textAlign: "center", fontStyle: "italic" }}>
              * Esta é uma simulação visual. Para acerto exato, leve a peça física para nossa loja.
            </p>
          </div>
        )}

        {!loading && code && !result && (
           <div style={{ marginTop: 24, padding: 16, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, fontSize: 13, color: "#991b1b", display: "flex", alignItems: "center", gap: 10 }}>
             <AlertCircle size={18} />
             <div>
               <strong>Código não encontrado.</strong><br />
               Não localizamos a cor para {code}. Por favor, verifique se o código está correto ou fale com nossos especialistas.
             </div>
           </div>
        )}
      </div>
    </div>
  )
}

export default ColorPage
