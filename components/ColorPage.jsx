"use client"

import React, { useMemo, useState } from "react"
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
  const [year, setYear] = useState("")
  const [group, setGroup] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")

  const canSearch = useMemo(() => mode === "code"
    ? Boolean(code.trim() && manufacturer.trim() && model.trim())
    : Boolean(manufacturer.trim() && model.trim()), [mode, code, manufacturer, model])

  async function handleSearch(event) {
    event?.preventDefault()
    if (!canSearch || loading) return

    setLoading(true)
    setError("")
    setSearched(true)
    setResults([])

    try {
      const params = new URLSearchParams()
      if (mode === "code") params.set("code", code.trim())
      if (manufacturer) params.set("manufacturer", manufacturer.trim())
      if (model) params.set("model", model.trim())
      if (year) params.set("year", year)
      if (group) params.set("group", group)
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
    setYear("")
    setGroup("")
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
                  <input value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="Ex.: Toyota, Honda, VW" style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Modelo</label>
                  <input value={model} onChange={e => setModel(e.target.value)} placeholder="Ex.: Corolla, Civic, Onix" style={FIELD_STYLE} />
                </div>
                {mode === "code" && <div>
                  <label style={LABEL_STYLE}>Código da cor / código OEM</label>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Código da etiqueta do veículo" style={FIELD_STYLE} />
                </div>}
                <div>
                  <label style={LABEL_STYLE}>Ano do veículo</label>
                  <input type="number" min="1950" max="2035" value={year} onChange={e => setYear(e.target.value)} placeholder="Ex.: 2020" style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Grupo / família de cor</label>
                  <select value={group} onChange={e => setGroup(e.target.value)} style={FIELD_STYLE}>
                    <option value="">Todos os grupos</option>
                    <option value="Branco">Branco</option>
                    <option value="Preto">Preto</option>
                    <option value="Prata">Prata</option>
                    <option value="Cinza">Cinza</option>
                    <option value="Vermelho">Vermelho</option>
                    <option value="Azul">Azul</option>
                    <option value="Verde">Verde</option>
                    <option value="Amarelo">Amarelo</option>
                    <option value="Marrom">Marrom</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
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
        <CheckCircle2 size={13} /> Consulta automotiva · Catálogo público de cores automotivas
      </div>
    </main>
  )
}
