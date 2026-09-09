"use client"
import React, { useState } from "react"
import { Calculator, Plus, Minus, X, Check, RotateCcw, Info } from "lucide-react"
import { calculatePaint, Wall, Opening, CalculationResult } from "@/lib/calc-utils"

interface WallInput {
  width: string;
  height: string;
}

const CalculatorPage = () => {
  const [walls, setWalls] = useState<WallInput[]>([{ width: "", height: "" }])
  const [openings, setOpenings] = useState<Opening[]>([
    { type: 'door', count: 1 },
    { type: 'window', count: 1 }
  ])
  const [ceilingArea, setCeilingArea] = useState(0)
  const [coats, setCoats] = useState(2)
  const [coverage, setCoverage] = useState(400)
  const [result, setResult] = useState<CalculationResult | null>(null)

  const resetAll = () => {
    setWalls([{ width: "", height: "" }])
    setOpenings([{ type: 'door', count: 1 }, { type: 'window', count: 1 }])
    setCeilingArea(0)
    setCoats(2)
    setCoverage(400)
    setResult(null)
  }

  const addWall = () => setWalls([...walls, { width: "", height: "" }])
  const removeWall = (idx: number) => {
    if (walls.length > 1) {
      setWalls(walls.filter((_, i) => i !== idx))
    }
  }
  const updateWall = (idx: number, field: keyof WallInput, val: string) => {
    const newWalls = [...walls]
    newWalls[idx] = { ...newWalls[idx], [field]: val }
    setWalls(newWalls)
  }
  const updateOpening = (type: 'door' | 'window', delta: number) => {
    setOpenings(prev => prev.map(o => o.type === type ? { ...o, count: Math.max(0, o.count + delta) } : o))
  }
  const calculate = () => {
    const parsedWalls = walls.map(w => ({
      width: parseFloat(w.width) || 0,
      height: parseFloat(w.height) || 0
    })).filter(w => w.width > 0 && w.height > 0)

    if (parsedWalls.length === 0) {
      alert("Por favor, insira as dimensões de pelo menos uma parede.")
      return
    }

    const res = calculatePaint(parsedWalls, openings, ceilingArea, coverage, coats)
    setResult(res)
  }

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calculator size={22} color="#34d399" />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Calculadora de Tinta</h1>
          </div>
          <button onClick={resetAll} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <RotateCcw size={14} /> Limpar
          </button>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>Calcule exatamente quanto tinta você precisa. Sem desperdício!</p>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", margin: 0 }}>📐 Dimensões das Paredes</h3>
            <button onClick={addWall} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={14} /> Adicionar Parede
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
            {walls.map((wall, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end", padding: "12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Largura (m)</label>
                  <input type="number" value={wall.width} onChange={e => updateWall(idx, 'width', e.target.value)} placeholder="0.0"
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>Altura (m)</label>
                  <input type="number" value={wall.height} onChange={e => updateWall(idx, 'height', e.target.value)} placeholder="0.0"
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <button onClick={() => removeWall(idx)} style={{ width: 32, height: 32, border: "1px solid #fca5a5", borderRadius: 8, background: "white", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Área do Teto (m²) - Opcional</label>
            <input type="number" value={ceilingArea || ""} onChange={e => setCeilingArea(parseFloat(e.target.value) || 0)} placeholder="Ex: 15.0"
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>🪟 Descontar aberturas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ background: "#f9fafb", padding: "12px", borderRadius: 10, border: "1px solid #e5e7eb" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Portas</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => updateOpening('door', -1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{openings.find(o => o.type === 'door')?.count || 0}</span>
                <button onClick={() => updateOpening('door', 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
              </div>
            </div>
            <div style={{ background: "#f9fafb", padding: "12px", borderRadius: 10, border: "1px solid #e5e7eb" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Janelas</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => updateOpening('window', -1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{openings.find(o => o.type === 'window')?.count || 0}</span>
                <button onClick={() => updateOpening('window', 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Número de demãos: <strong style={{ color: "#1a1464" }}>{coats}</strong></label>
            <input type="range" min={1} max={3} value={coats} onChange={e => setCoats(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#1a1464" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999" }}>
              <span>1 demão</span><span>2 demãos (rec.)</span><span>3 demãos</span>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Rendimento da tinta (m²/L)</label>
            <select value={coverage} onChange={e => setCoverage(Number(e.target.value))}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 13, background: "white", outline: "none" }}>
              <option value={280}>Baixo rendimento – 280 m²/18L</option>
              <option value={350}>Médio rendimento – 350 m²/18L</option>
              <option value={400}>Alto rendimento – 400 m²/18L (padrão)</option>
              <option value={450}>Premium – 450 m²/18L</option>
            </select>
          </div>
          <button onClick={calculate}
            style={{ width: "100%", background: "linear-gradient(135deg, #064e3b, #065f46)", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            🧮 Calcular
          </button>
        </div>
        {result && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "2px solid #059669" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={18} /> Resultado do cálculo
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px", marginBottom: 16, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 8, textTransform: "uppercase" }}>Detalhamento da Área:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#444" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Área Bruta:</span> <span>{result.grossArea} m²</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#ef4444" }}><span>Descontos (Aberturas):</span> <span>- {result.deductions} m²</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, borderTop: "1px solid #ddd", paddingTop: 4, marginTop: 4, color: "#1a1464" }}><span>Área Líquida Final:</span> <span>{result.netArea} m²</span></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Tinta Necessária", value: result.totalLiters + " L", icon: "🪣" },
                { label: "Margem de Segurança", value: "+" + result.wasteAmount + " L", icon: "🛡️" },
              ].map(item => (
                <div key={item.label} style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 10px", textAlign: "center", border: "1px solid #86efac" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1464" }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Selador (Primer)", value: result.primerCans, icon: "🖌️" },
                { label: "Massa Corrida", value: result.puttyCans, icon: "🧱" },
              ].map(item => (
                <div key={item.label} style={{ background: "#fdf2f8", borderRadius: 10, padding: "12px 10px", textAlign: "center", border: "1px solid #fbcfe8" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1464" }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "16px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#4338ca", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Info size={16} /> Recomendação de Compra:
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1a1464" }}>{result.suggestedCans}</div>
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "16px", fontSize: 14, color: "#78350f", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>💰 Estimativa de Investimento: { "R$ " + result.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }</div>
              <div style={{ fontSize: 11 }}>Cálculo baseado em preços médios de mercado para as latas sugeridas.</div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#78350f" }}>
              💡 A margem de segurança de 10% foi incluída para evitar a falta de tinta durante a aplicação.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculatorPage
