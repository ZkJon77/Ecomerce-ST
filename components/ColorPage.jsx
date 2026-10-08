"use client"
import React, { useState } from "react"
import { Paintbrush, Check, AlertCircle } from "lucide-react"

const COLOR_MAP = {
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
};

const CAR_MODELS = [
  { brand: "Honda", model: "Civic", years: { "2012-2015": "NH731P", "2016-2020": "NH731S" } },
  { brand: "Honda", model: "Fit", years: { "2009-2014": "NH731", "2015-2021": "NH731P" } },
  { brand: "Toyota", model: "Corolla", years: { "2010-2015": "NH444P", "2016-2022": "NH700P" } },
  { brand: "Hyundai", model: "HB20", years: { "2013-2018": "NH789P", "2019-2023": "NH800P" } },
  { brand: "Volkswagen", model: "Gol", years: { "2008-2016": "NH555P", "2017-2022": "NH444P" } },
];

const ColorPage = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchMode, setSearchMode] = useState("code") // "code" or "car"
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  const brands = Array.from(new Set(CAR_MODELS.map(m => m.brand)))

  const filteredModels = selectedBrand
    ? CAR_MODELS.filter(m => m.brand === selectedBrand).map(m => m.model)
    : []

  const filteredYears = selectedModel && selectedBrand
    ? CAR_MODELS.find(m => m.brand === selectedBrand && m.model === selectedModel)?.years
    : null

  const handleSearchByCode = () => {
    if (!code) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setLoading(false);
      const found = COLOR_MAP[code.toUpperCase()];
      setResult(found || null);
    }, 800)
  }

  const handleSearchByCar = () => {
    if (!selectedBrand || !selectedModel || !selectedYear) {
      alert("Por favor, selecione a marca, o modelo e o ano do seu veículo.")
      return
    }
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setLoading(false);
      const car = CAR_MODELS.find(m => m.brand === selectedBrand && m.model === selectedModel);
      const colorCode = car?.years[selectedYear];
      const found = colorCode ? COLOR_MAP[colorCode] : null;
      setResult(found);
    }, 800)
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2a52be 100%)", borderRadius: 12, padding: "20px 16px", marginBottom: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Paintbrush size={24} color="#fbbf24" />
          <div style={{ fontSize: 18, fontWeight: 800 }}>Consultar Cor do Veículo</div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Encontre a tinta exata para o seu carro selecionando o modelo ou digitando o código de pintura.</p>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => setSearchMode("code")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: searchMode === "code" ? "#1a1464" : "#f3f4f6", color: searchMode === "code" ? "white" : "#666", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Por Código</button>
          <button onClick={() => setSearchMode("car")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: searchMode === "car" ? "#1a1464" : "#f3f4f6", color: searchMode === "car" ? "white" : "#666", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Por Veículo</button>
        </div>

        {searchMode === "code" ? (
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Código da cor (Ex: NH731P)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Digite o código aqui..."
                style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", fontWeight: 600 }} />
              <button onClick={handleSearchByCode} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {loading ? "Buscando..." : "Buscar Cor"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Marca</label>
              <select value={selectedBrand} onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(""); setSelectedYear(""); }} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none" }}>
                <option value="">Selecione a Marca</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Modelo</label>
              <select value={selectedModel} onChange={e => { setSelectedModel(e.target.value); setSelectedYear(""); }} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", disabled: !selectedBrand }}>
                <option value="">Selecione o Modelo</option>
                {filteredModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Ano / Versão</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "12px", fontSize: 14, outline: "none", disabled: !selectedModel }}>
                <option value="">Selecione o Ano</option>
                {filteredYears && Object.keys(filteredYears).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={handleSearchByCar} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
              {loading ? "Buscando..." : "Encontrar Cor do Carro"}
            </button>
          </div>
        )}

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
                  Código: {searchMode === "code" ? code.toUpperCase() : "Encontrado via Modelo"}
                </div>
              </div>
            </div>
            <p style={{ marginTop: 12, fontSize: 11, color: "#999", textAlign: "center", fontStyle: "italic" }}>
              * Esta é uma simulação visual. Para acerto exato, leve a peça física para nossa loja.
            </p>
          </div>
        )}

        {!loading && (searchMode === "code" ? (code && !result) : (selectedBrand && selectedModel && selectedYear && !result)) && (
           <div style={{ marginTop: 24, padding: 16, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, fontSize: 13, color: "#991b1b", display: "flex", alignItems: "center", gap: 10 }}>
             <AlertCircle size={18} />
             <div>
               <strong>Cor não encontrada.</strong><br />
               Não localizamos a cor para as informações fornecidas. Por favor, verifique os dados ou fale com nossos especialistas.
             </div>
           </div>
        )}
      </div>
    </div>
  )
}

export default ColorPage
