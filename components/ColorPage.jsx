"use client"
import React, { useState } from "react"
import { Paintbrush, Check, AlertCircle, MessageCircle, X, Send, Sparkles } from "lucide-react"
import { COLOR_MAP, CAR_MODELS } from "@/lib/constants/colors"
import SilverMascot from "./SilverMascot"

const ColorPage = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchMode, setSearchMode] = useState("code") // "code" or "car"
  const [searchTerm, setSearchTerm] = useState("")
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

  const handleGlobalSearch = () => {
    if (!searchTerm) return;
    setLoading(true);
    setResult(null);
    // Removido o setTimeout para tornar a busca instantânea
    const term = searchTerm.toLowerCase();

    const carMatch = CAR_MODELS.find(m =>
      m.brand.toLowerCase().includes(term) ||
      m.model.toLowerCase().includes(term)
    );

    if (carMatch) {
      const firstYear = Object.keys(carMatch.years)[0];
      const colorCode = carMatch.years[firstYear];
      setResult(COLOR_MAP[colorCode] || null);
      setLoading(false);
      return;
    }

    const colorMatch = Object.entries(COLOR_MAP).find(([code, data]) =>
      data.name.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term)
    );

    if (colorMatch) {
      setResult(colorMatch[1]);
      setLoading(false);
      return;
    }

    setResult(null);
    setLoading(false);
  }

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1464] to-[#2a52be] rounded-2xl p-5 md:p-6 mb-4 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Paintbrush size={24} className="text-yellow-400" />
            <h1 className="text-lg md:text-xl font-extrabold">Consultar Cor do Veículo</h1>
          </div>
          <p className="text-xs md:text-sm text-white/70">Encontre a tinta exata para o seu carro selecionando o modelo ou digitando o código de pintura.</p>
        </div>

        {/* Main Search Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => setSearchMode("code")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-200 text-sm ${searchMode === "code" ? "bg-[#1a1464] text-white" : "bg-gray-100 text-gray-600"}`}>
              Por Código
            </button>
            <button onClick={() => setSearchMode("car")}
              className={`flex-1 py-2.5 rounded-lg font-bold transition-all duration-200 text-sm ${searchMode === "car" ? "bg-[#1a1464] text-white" : "bg-gray-100 text-gray-600"}`}>
              Por Veículo
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-800 block mb-2">Busca Rápida (Marca, Modelo, Cor...)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Digite o que procura..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464]"
              />
              <button onClick={handleGlobalSearch}
                className="bg-[#1a1464] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-indigo-900 transition-colors">
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {searchMode === "code" ? (
            <div>
              <label className="text-sm font-bold text-gray-800 block mb-2">Código da cor (Ex: NH731P)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Digite o código aqui..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464]"
                />
                <button onClick={handleSearchByCode}
                  className="bg-[#1a1464] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-indigo-900 transition-colors">
                  {loading ? "Buscando..." : "Buscar Cor"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-800 block mb-2">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={e => { setSelectedBrand(e.target.value); setSelectedModel(""); setSelectedYear(""); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464]"
                >
                  <option value="">Selecione a Marca</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800 block mb-2">Modelo</label>
                <select
                  value={selectedModel}
                  onChange={e => { setSelectedModel(e.target.value); setSelectedYear(""); }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464] disabled:bg-gray-100"
                  disabled={!selectedBrand}
                >
                  <option value="">Selecione o Modelo</option>
                  {filteredModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-800 block mb-2">Ano / Versão</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1a1464]/20 focus:border-[#1a1464] disabled:bg-gray-100"
                  disabled={!selectedModel}
                >
                  <option value="">Selecione o Ano</option>
                  {filteredYears && Object.keys(filteredYears).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={handleSearchByCar}
                className="bg-[#1a1464] text-white py-4 rounded-lg text-sm font-bold hover:bg-indigo-900 transition-colors mt-2">
                {loading ? "Buscando..." : "Encontrar Cor do Carro"}
              </button>
            </div>
          )}

          {result && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 mb-3 text-green-700 text-sm font-bold">
                <Check size={18} /> Cor Localizada com Sucesso!
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center md:text-left">
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-lg border-4 border-white shrink-0"
                  style={{ backgroundColor: result.hex }}
                />
                <div>
                  <h3 className="text-xl font-extrabold text-[#1a1464] mb-1">{result.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{result.description}</p>
                  <span className="inline-block bg-gray-200 px-2 py-1 rounded text-[11px] font-bold text-gray-700 uppercase">
                    Código: {searchMode === "code" ? code.toUpperCase() : "Encontrado via Modelo"}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 text-center italic">
                * Esta é uma simulação visual. Para acerto exato, leve a peça física para nossa loja.
              </p>
            </div>
          )}

          {!loading && (searchMode === "code" ? (code && !result) : (selectedBrand && selectedModel && selectedYear && !result)) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center gap-3">
              <AlertCircle size={18} />
              <div>
                <strong className="font-bold">Cor não encontrada.</strong><br />
                Não localizamos a cor para as informações fornecidas. Por favor, verifique os dados ou fale com nossos especialistas.
              </div>
            </div>
          )}
        </div>
      </div>

      <SilverMascot result={result} />
    </div>
  )
}

export default ColorPage
