"use client"
import React, { useState } from "react"
import { Calculator, Plus, Minus, X, Check, RotateCcw, Info, ShoppingCart, FileText } from "lucide-react"
import { calculatePaint, Wall, Opening, CalculationResult } from "@/lib/calc-utils"

const CalculatorPage = () => {
  const [walls, setWalls] = useState([{ width: "", height: "" }])
  const [openings, setOpenings] = useState([
    { type: 'door', count: 1 },
    { type: 'window', count: 1 }
  ])
  const [ceilingLength, setCeilingLength] = useState(0)
  const [ceilingWidth, setCeilingWidth] = useState(0)
  const [coats, setCoats] = useState(2)
  const [coverage, setCoverage] = useState(400)
  const [result, setResult] = useState(null)

  const resetAll = () => {
    setWalls([{ width: "", height: "" }])
    setOpenings([{ type: 'door', count: 1 }, { type: 'window', count: 1 }])
    setCeilingLength(0)
    setCeilingWidth(0)
    setCoats(2)
    setCoverage(400)
    setResult(null)
  }

  const addWall = () => setWalls([...walls, { width: "", height: "" }])
  const removeWall = (idx) => {
    if (walls.length > 1) {
      setWalls(walls.filter((_, i) => i !== idx))
    }
  }
  const updateWall = (idx, field, val) => {
    const newWalls = [...walls]
    newWalls[idx] = { ...newWalls[idx], [field]: val }
    setWalls(newWalls)
  }
  const updateOpening = (type, delta) => {
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

    const res = calculatePaint(parsedWalls, openings, ceilingLength, ceilingWidth, coverage, coats)
    setResult(res)
  }

  const sendToWhatsApp = () => {
    if (!result) return;
    const phone = "551932660789";
    const message = `*🎨 Projeto de Pintura Silver Tintas*\n\n` +
      `*Área Líquida:* ${result.netArea} m²\n` +
      `*Tinta Recomendada:* ${result.recommendedProduct}\n` +
      `*Quantidade:* ${result.suggestedCans}\n` +
      `*Materiais:* ${result.suggestedTools.join(", ")}\n\n` +
      `*Investimento Estimado:* R$ ${result.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `Gostaria de solicitar um orçamento formal para este projeto!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#064e3b] to-[#065f46] rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calculator size={28} className="text-green-300" />
            <h1 className="text-2xl font-extrabold">Planejador de Pintura Silver</h1>
          </div>
          <button onClick={resetAll} className="bg-white/20 hover:bg-white/30 border-none text-white rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
            <RotateCcw size={14} /> Limpar
          </button>
        </div>
        <p className="text-sm text-green-100 opacity la-80">Transforme seu ambiente com precisão. O diferencial da Silver Tintas no seu projeto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paredes Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1a1464] flex items-center gap-2">📐 Dimensões das Paredes</h3>
              <button onClick={addWall} className="bg-[#1a1464] text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-indigo-900 transition-colors flex items-center gap-1">
                <Plus size={14} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {walls.map((wall, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-3 items-end p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Largura (m)</label>
                    <input type="number" value={wall.width} onChange={e => updateWall(idx, 'width', e.target.value)} placeholder="0.0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Altura (m)</label>
                    <input type="number" value={wall.height} onChange={e => updateWall(idx, 'height', e.target.value)} placeholder="0.0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <button onClick={() => removeWall(idx)} className="w-10 h-10 border border-red-200 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Teto e Aberturas Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-[#1a1464] mb-4 flex items-center gap-2">🏠 Área do Teto</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Comprimento (m)</label>
                    <input type="number" value={ceilingLength || ""} onChange={e => setCeilingLength(parseFloat(e.target.value) || 0)} placeholder="0.0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Largura (m)</label>
                    <input type="number" value={ceilingWidth || ""} onChange={e => setCeilingWidth(parseFloat(e.target.value) || 0)} placeholder="0.0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a1464] mb-4 flex items-center gap-2">🪟 Aberturas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-600">Portas</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateOpening('door', -1)} className="w-8 h-8 border border-gray-300 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"><Minus size={14} /></button>
                      <span className="text-sm font-extrabold w-4 text-center">{openings.find(o => o.type === 'door')?.count || 0}</span>
                      <button onClick={() => updateOpening('door', 1)} className="w-8 h-8 border border-gray-300 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-600">Janelas</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateOpening('window', -1)} className="w-8 h-8 border border-gray-300 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"><Minus size={14} /></button>
                      <span className="text-sm font-extrabold w-4 text-center">{openings.find(o => o.type === 'window')?.count || 0}</span>
                      <button onClick={() => updateOpening('window', 1)} className="w-8 h-8 border border-gray-300 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações Adicionais */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-[#1a1464] mb-4">⚙️ Ajustes de Pintura</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-3">Número de demãos: <span className="text-[#1a1464]">{coats}</span></label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setCoats(num)}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all ${coats === num ? "bg-[#1a1464] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {num} {num === 1 ? 'Demão' : 'Demãos'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Rendimento da Tinta</label>
                <select value={coverage} onChange={e => setCoverage(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
                  <option value={280}>Baixo rendimento – 280 m²/18L</option>
                  <option value={350}>Médio rendimento – 350 m²/18L</option>
                  <option value={400}>Alto rendimento – 400 m²/18L (padrão)</option>
                  <option value={450}>Premium – 450 m²/18L</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={calculate}
            className="w-full bg-gradient-to-r from-[#064e3b] to-[#065f46] text-white py-4 rounded-2xl text-lg font-extrabold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3">
            <Calculator size={24} /> Calcular Projeto
          </button>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-start-3">
        {result && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-500 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 mb-6 text-green-600 font-extrabold text-lg">
              <Check size={24} /> Projeto Finalizado!
            </div>

            <div className="space-y-6">
              {/* Produto Recomendado */}
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                <span className="text-[11px] font-bold text-green-600 uppercase block mb-1">Tinta Recomendada</span>
                <div className="text-lg font-black text-[#1a1464]">{result.recommendedProduct}</div>
              </div>

              {/* Áreas Card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <FileText size={14} /> Detalhamento da Área
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Área Bruta:</span> <span className="font-bold">{result.grossArea} m²</span></div>
                  <div className="flex justify-between text-red-500"><span>Aberturas:</span> <span className="font-bold">- {result.deductions} m²</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-black text-[#1a1464]">
                    <span>Área Líquida:</span> <span>{result.netArea} m²</span>
                  </div>
                </div>
              </div>

              {/* Quantidades */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                  <div className="text-xl mb-1">🪣</div>
                  <div className="text-lg font-black text-[#1a1464]">{result.totalLiters} L</div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase">Tinta Total</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
                  <div className="text-xl mb-1">🛡️</div>
                  <div className="text-lg font-black text-[#1a1464]">{result.wasteAmount} L</div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase">Segurança</div>
                </div>
              </div>

              {/* Materiais Adicionais */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase mb-3">Materiais Adicionais</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Selador:</span> <span className="font-bold">{result.primerCans}</span></div>
                  <div className="flex justify-between"><span>Massa Corrida:</span> <span className="font-bold">{result.puttyCans}</span></div>
                </div>
              </div>

              {/* Ferramentas */}
              <div className="flex flex-wrap gap-2 mb-6">
                {result.suggestedTools.map((tool, idx) => (
                  <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded-full text-[10px] font-bold text-gray-600 shadow-sm">
                    {tool}
                  </span>
                ))}
              </div>

              {/* Custo */}
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 text-center">
                <div className="text-xs font-bold text-yellow-700 uppercase mb-1">Investimento Estimado</div>
                <div className="text-2xl font-black text-yellow-800">R$ {result.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-3">
                <button onClick={sendToWhatsApp} className="w-full bg-green-500 text-white py-3 rounded-xl font-extrabold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <ShoppingCart size={20} /> Pedir Orçamento via WhatsApp
                </button>
                <button className="w-full bg-white text-gray-600 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  <FileText size={20} /> Salvar PDF do Projeto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculatorPage
