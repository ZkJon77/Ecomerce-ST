"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Search, CarFront, Palette, AlertCircle, CheckCircle2, Loader2, Info, RotateCcw } from "lucide-react"

const FIELD_STYLE = {
  width: "100%",
  border: "1px solid #d8dbe8",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#182044",
  background: "#fff",
  fontSize: 14,
  outline: "none",
}

const LABEL_STYLE = {
  display: "block",
  color: "#34405f",
  fontSize: 12,
  fontWeight: 750,
  marginBottom: 7,
}

function ResultCard({ item }) {
  const yearLabel = item.year_start && item.year_end
    ? item.year_start === item.year_end ? item.year_start : item.year_start + "–" + item.year_end
    : "Ano não informado"

  return (
    <article style={{ border: "1px solid #e4e7f0", borderRadius: 14, padding: 16, background: "#fff", display: "flex", gap: 15, alignItems: "flex-start" }}>
      <div style={{ width: 76, height: 76, flexShrink: 0, borderRadius: 12, background: item.color_hex || "linear-gradient(135deg,#d8dbe2,#f8f8fa)", border: "1px solid #d9dce5", display: "grid", placeItems: "center", color: "#6b7280" }}>
        {!item.color_hex && <Palette size={23} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", marginBottom: 5 }}>
          <strong style={{ color: "#171d45", fontSize: 17 }}>{item.color_name || "Cor automotiva"}</strong>
          <span style={{ background: "#eef0ff", color: "#28236f", borderRadius: 20, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>{item.color_code}</span>
        </div>
        <p style={{ margin: "0 0 8px", color: "#626b83", fontSize: 13 }}>
          {[item.manufacturer, item.model, yearLabel].filter(Boolean).join(" · ")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.color_group && <span style={{ background: "#f3f4f7", color: "#4b5563", padding: "4px 8px", borderRadius: 6, fontSize: 11 }}>{item.color_group}</span>}
          {item.finish && <span style={{ background: "#f3f4f7", color: "#4b5563", padding: "4px 8px", borderRadius: 6, fontSize: 11 }}>{item.finish}</span>}
          {item.paint_system && <span style={{ background: "#f3f4f7", color: "#4b5563", padding: "4px 8px", borderRadius: 6, fontSize: 11 }}>{item.paint_system}</span>}
        </div>
        {item.notes && <p style={{ color: "#69738a", fontSize: 12, margin: "9px 0 0", lineHeight: 1.5 }}>{item.notes}</p>}
        <p style={{ color: "#8790a4", fontSize: 10, margin: "9px 0 0" }}>
          {item.source_name ? "Fonte: " + item.source_name : "Registro da base Silver Tintas"}
          {item.verified_at ? " · Verificado em " + new Date(item.verified_at).toLocaleDateString("pt-BR") : ""}
        </p>
      </div>
    </article>
  )
}

export default function ColorPage() {
  const [mode, setMode] = useState("vehicle")
  const [code, setCode] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [model, setModel] = useState("")
  const [makeId, setMakeId] = useState("")
  const [modelId, setModelId] = useState("")
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [year, setYear] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [popularVehicles, setPopularVehicles] = useState([])
  const [popularColors, setPopularColors] = useState([])

  useEffect(() => {
    let active = true
    fetch("/api/automotive-colors?action=live-makes", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Montadoras indisponíveis")))
      .then(payload => {
        if (active) setMakes(Array.isArray(payload.makes) ? payload.makes : [])
      })
      .catch(() => { if (active) setMakes([]) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!makeId) {
      setModels([])
      setModelId("")
      return
    }
    let active = true
    fetch("/api/automotive-colors?action=live-models&makeId=" + encodeURIComponent(makeId), { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Modelos indisponíveis")))
      .then(payload => {
        if (!active) return
        const nextModels = Array.isArray(payload.models) ? payload.models : []
        setModels(nextModels)
      })
      .catch(() => { if (active) { setModels([]); setModelId("") } })
    return () => { active = false }
  }, [makeId])

  useEffect(() => {
    const selected = models.find(item => item.model.toLowerCase() === model.toLowerCase())
    setModelId(selected?.id || "")
  }, [models, model])

  useEffect(() => {
    let active = true
    fetch("/api/automotive-colors?popular=1", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Destaques indisponíveis")))
      .then(payload => {
        if (!active) return
        setPopularVehicles(Array.isArray(payload.vehicles) ? payload.vehicles : [])
        setPopularColors(Array.isArray(payload.popularColors) ? payload.popularColors : [])
      })
      .catch(() => {
        if (active) {
          setPopularVehicles([])
          setPopularColors([])
        }
      })
    return () => { active = false }
  }, [])

  const canSearch = useMemo(() => mode === "code"
    ? Boolean(code.trim() && makeId && modelId)
    : Boolean(makeId && modelId), [mode, code, makeId, modelId])

  async function handleSearch(event) {
    event?.preventDefault()
    if (!canSearch || loading) return

    setLoading(true)
    setError("")
    setSearched(true)
    setResults([])

    try {
      const params = new URLSearchParams()
      params.set("action", "live-colors")
      params.set("makeId", makeId)
      params.set("modelId", modelId)
      if (mode === "code") params.set("code", code.trim())
      if (year) params.set("year", year)
      if (query.trim()) params.set("q", query.trim())

      const response = await fetch("/api/automotive-colors?" + params.toString(), { cache: "no-store" })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(payload.error || "Não foi possível consultar a base de cores.")
      setResults(Array.isArray(payload.results) ? payload.results : [])
      if (payload.notice) setError(payload.notice)
    } catch (err) {
      setError(err.message || "Falha ao consultar as cores. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function resetSearch() {
    setCode("")
    setManufacturer("")
    setModel("")
    setMakeId("")
    setModelId("")
    setModels([])
    setYear("")
    setQuery("")
    setResults([])
    setError("")
    setSearched(false)
  }

  const tabStyle = (active) => ({
    flex: 1,
    border: active ? "1px solid #25206f" : "1px solid #e0e3ed",
    background: active ? "#25206f" : "#fff",
    color: active ? "#fff" : "#515b73",
    borderRadius: 9,
    padding: "12px 10px",
    fontWeight: 750,
    fontSize: 13,
    cursor: "pointer",
  })

  return (
    <main style={{ padding: "34px 18px 54px", maxWidth: 1040, margin: "0 auto", color: "#182044" }}>
      <section style={{ background: "linear-gradient(120deg,#17134f 0%,#292477 58%,#3157a7 100%)", borderRadius: 18, padding: "clamp(22px,4vw,36px)", color: "#fff", marginBottom: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #ffffff40", background: "#ffffff14", borderRadius: 30, padding: "6px 11px", fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
            <CarFront size={15} /> Centro de consulta automotiva
          </div>
          <h1 style={{ fontSize: "clamp(25px,4vw,36px)", lineHeight: 1.12, margin: "16px 0 10px", fontWeight: 850 }}>Encontre a identificação da cor do seu veículo</h1>
          <p style={{ color: "#e0e4ff", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            Pesquise por montadora e modelo, ou filtre pelo código OEM. Os registros disponíveis dependem da cobertura do catálogo público.
          </p>
        </div>
        <div style={{ position: "absolute", right: -28, bottom: -62, opacity: .12 }}><CarFront size={240} /></div>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7ef", borderRadius: 16, padding: "clamp(18px,3vw,28px)", boxShadow: "0 8px 28px #17204a0a" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9, marginBottom: 22 }}>
          <button type="button" onClick={() => { setMode("vehicle"); resetSearch() }} style={tabStyle(mode === "vehicle")}><CarFront size={16} style={{ verticalAlign: "middle", marginRight: 7 }} />Por veículo</button>
          <button type="button" onClick={() => { setMode("code"); resetSearch() }} style={tabStyle(mode === "code")}><Search size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />Por código</button>
        </div>

        <form onSubmit={handleSearch}>
          <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
                <div>
                  <label style={LABEL_STYLE}>Montadora</label>
                  <select value={makeId} onChange={e => {
                    const selected = makes.find(item => item.id === e.target.value)
                    setMakeId(e.target.value)
                    setManufacturer(selected?.brand || "")
                    setModel("")
                    setModelId("")
                  }} style={FIELD_STYLE}>
                    <option value="">Selecione a montadora</option>
                    {makes.map(item => <option key={item.id} value={item.id}>{item.brand} · {item.country}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Modelo</label>
                  <select value={modelId} disabled={!makeId || models.length === 0} onChange={e => {
                    const selected = models.find(item => item.id === e.target.value)
                    setModelId(e.target.value)
                    setModel(selected?.model || "")
                  }} style={{ ...FIELD_STYLE, opacity: makeId ? 1 : .65 }}>
                    <option value="">{makeId ? "Selecione o modelo" : "Escolha uma montadora primeiro"}</option>
                    {models.map(item => <option key={item.id} value={item.id}>{item.model}{item.segment ? " · " + item.segment : ""}</option>)}
                  </select>
                </div>
                {mode === "code" && <div>
                  <label style={LABEL_STYLE}>Código da cor / código OEM</label>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Código da etiqueta do veículo" style={FIELD_STYLE} />
                </div>}
                <div>
                  <label style={LABEL_STYLE}>Ano do veículo (referência)</label>
                  <input type="number" min="1950" max="2035" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex.: 2020" style={FIELD_STYLE} />
                  <p style={{ color: "#788198", fontSize: 10, margin: "5px 0 0" }}>A API não confirma a cor por ano específico.</p>
                </div>
              </div>
              <p style={{ color: "#788198", fontSize: 11, margin: "10px 0 0" }}>
                Catálogo público appByte: {makes.length || "—"} montadoras carregadas. Modelos e cores são consultados diretamente na API; a cobertura varia conforme os dados publicados.
              </p>
              <div style={{ marginTop: 14 }}>
                <label style={LABEL_STYLE}>Descrição ou nome da cor (opcional)</label>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: prata metálico, branco perolizado..." style={FIELD_STYLE} />
              </div>
          </>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
            <button type="submit" disabled={!canSearch || loading} style={{ border: 0, borderRadius: 9, background: canSearch ? "#25206f" : "#aeb2c4", color: "#fff", padding: "13px 22px", fontSize: 13, fontWeight: 800, cursor: canSearch ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? "Consultando base..." : "Pesquisar cores"}
            </button>
            <button type="button" onClick={resetSearch} style={{ border: "1px solid #dfe2eb", background: "#fff", color: "#505a72", borderRadius: 9, padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <RotateCcw size={14} /> Limpar
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 24, padding: "22px clamp(16px,3vw,24px)", background: "#f7f8fc", border: "1px solid #e5e8f1", borderRadius: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "end", marginBottom: 14 }}>
          <div>
            <h2 style={{ color: "#171d45", fontSize: 19, margin: 0 }}>Veículos em destaque no Brasil</h2>
            <p style={{ color: "#69738a", fontSize: 12, margin: "5px 0 0" }}>Seleção baseada no ranking Fenabrave de outubro de 2026. Escolha um modelo para consultar as cores disponíveis.</p>
          </div>
          <span style={{ fontSize: 10, color: "#7c8498" }}>Fonte: Fenabrave</span>
        </div>
        {popularVehicles.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 9 }}>
            {popularVehicles.map((vehicle) => (
              <button key={vehicle.manufacturer + vehicle.model} type="button"
                onClick={() => {
                  setMode("vehicle")
                  const selectedMake = makes.find(item => item.brand.toLowerCase() === vehicle.manufacturer.toLowerCase())
                  setMakeId(selectedMake?.id || "")
                  setManufacturer(vehicle.manufacturer)
                  setModel(vehicle.model)
                  setModelId("")
                  setCode("")
                  setQuery("")
                  setYear("")
                  setResults([])
                  setError("")
                  setSearched(false)
                }}
                style={{ textAlign: "left", padding: "12px 13px", border: "1px solid #e0e4ef", borderRadius: 10, background: "#fff", cursor: "pointer" }}>
                <span style={{ display: "block", color: "#777f95", fontSize: 10, fontWeight: 800 }}>#{vehicle.sales_rank} · {vehicle.manufacturer}</span>
                <strong style={{ display: "block", color: "#20265a", fontSize: 13, marginTop: 4 }}>{vehicle.model}</strong>
                <span style={{ display: "block", color: "#6b7390", fontSize: 10, marginTop: 7 }}>Selecionar veículo →</span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#69738a", fontSize: 12 }}>Os destaques serão exibidos assim que o serviço de consulta estiver disponível.</p>
        )}
      </section>

      <section style={{ marginTop: 18, padding: "22px clamp(16px,3vw,24px)", background: "#fff", border: "1px solid #e5e8f1", borderRadius: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ color: "#171d45", fontSize: 19, margin: 0 }}>Cores mais consultadas</h2>
          <p style={{ color: "#69738a", fontSize: 12, margin: "5px 0 0" }}>Ranking calculado com as pesquisas reais feitas na Silver Tintas. Ele cresce conforme os clientes consultam o catálogo.</p>
        </div>
        {popularColors.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 9 }}>
            {popularColors.map((color) => (
              <button key={color.source_color_id} type="button"
                onClick={() => {
                  setMode("vehicle")
                  const selectedMake = makes.find(item => item.brand.toLowerCase() === color.manufacturer.toLowerCase())
                  setMakeId(selectedMake?.id || "")
                  setManufacturer(color.manufacturer)
                  setModel(color.model)
                  setModelId("")
                  setQuery(color.color_name)
                  setCode("")
                  setYear("")
                  setResults([])
                  setError("")
                  setSearched(false)
                }}
                style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: 11, border: "1px solid #e4e7ef", borderRadius: 10, background: "#fff", cursor: "pointer" }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: color.hex_code || "linear-gradient(135deg,#d8dbe2,#f8f8fa)", border: "1px solid #d9dce5" }} />
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", color: "#20265a", fontSize: 12 }}>{color.color_name}</strong>
                  <span style={{ display: "block", color: "#6b7390", fontSize: 10 }}>{color.manufacturer} {color.model} · {color.searches} consulta(s)</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "#69738a", fontSize: 12 }}>Ainda não há volume suficiente de pesquisas para montar um ranking. As primeiras consultas reais serão registradas aqui.</p>
        )}
      </section>

      <section style={{ marginTop: 18, borderRadius: 12, background: "#f1f4ff", border: "1px solid #dfe5ff", padding: 15, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Info size={18} color="#37318a" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: "#454d70", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
          A cor exibida na tela é apenas uma referência visual. Para repintura, confirme o código na etiqueta do veículo e valide a variante com a loja ou fabricante do sistema de tintas. O catálogo não fornece fórmula de mistura e não substitui leitura espectrofotométrica nem teste de aplicação.
        </p>
      </section>

      {error && (
        <div role="status" style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", display: "flex", gap: 9, fontSize: 13, lineHeight: 1.5 }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "#171d45" }}>Resultados encontrados</h2>
            <span style={{ color: "#68728a", fontSize: 12 }}>{results.length} registro(s)</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>{results.map(item => <ResultCard key={item.id} item={item} />)}</div>
        </section>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div style={{ marginTop: 22, padding: 22, border: "1px dashed #cbd0df", borderRadius: 13, textAlign: "center", background: "#fff" }}>
          <AlertCircle size={25} color="#777f95" />
          <h3 style={{ color: "#252b4b", margin: "9px 0 5px", fontSize: 16 }}>Nenhuma cor encontrada para esses filtros</h3>
          <p style={{ color: "#737c91", fontSize: 12, lineHeight: 1.6, margin: 0 }}>Confira os dados ou fale com a equipe Silver Tintas para validar a identificação da cor.</p>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, color: "#8a91a3", fontSize: 11 }}>
        <CheckCircle2 size={13} /> Consulta automotiva · API pública appByte
      </div>
    </main>
  )
}
