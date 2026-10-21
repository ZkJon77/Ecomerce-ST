"use client"
import React, { useState } from "react"
import { Send, Sparkles } from "lucide-react"

export default function ColorAssistant({ products = [] }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Bem-vindo ao Consultor Técnico de Cores.\n\nPor favor, informe a finalidade do ambiente ou a sensação desejada para que eu possa recomendar as tonalidades mais adequadas do nosso catálogo." }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const colorPsychology = {
    relaxante: ["azul", "verde", "bege", "branco", "cinza claro", "pastel"],
    moderno: ["grafite", "cinza", "preto", "branco", "azul marinho", "industrial"],
    energético: ["amarelo", "laranja", "vermelho", "vibrante", "forte"],
    aconchegante: ["marrom", "terracota", "bege", "amarelo ocre", "creme", "madeira"],
    elegante: ["dourado", "prata", "preto", "vinho", "azul royal", "perola"],
    limpo: ["branco", "gelo", "cinza claro", "off-white"],
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setInput("")
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setIsTyping(true)

    setTimeout(() => {
      const query = userMsg.toLowerCase()
      let matchedColors = []

      Object.keys(colorPsychology).forEach(feeling => {
        if (query.includes(feeling)) {
          matchedColors = [...matchedColors, ...colorPsychology[feeling]]
        }
      })

      products.forEach(p => {
        if (p.name.toLowerCase().includes(query)) {
          matchedColors.push(p.name.toLowerCase())
        }
      })

      const recommended = products.filter(p =>
        matchedColors.some(color => p.name.toLowerCase().includes(color))
      )

      let aiResponse = ""
      if (recommended.length > 0) {
        aiResponse = `Com base nos critérios informados, recomendo as seguintes opções do catálogo:\n\n` +
                     recommended.map(p => `- ${p.name}`).join('\\n')
      } else {
        aiResponse = "Não foram localizadas cores correspondentes a esses critérios. Sugiro utilizar termos como 'moderno', 'relaxante' ou 'aconchegante' para novas recomendações."
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }])
      setIsTyping(false)
    }, 800)
  }

  return (
    <div style={{
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      height: "600px",
      border: "1px solid #d1d5db",
      overflow: "hidden",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{ background: "#1a1464", color: "white", padding: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Sparkles size={18} color="#fbbf24" />
        <span style={{ fontWeight: "600", fontSize: "15px", letterSpacing: "0.5px" }}>Consultoria Técnica de Cores</span>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: m.role === 'user' ? "12px 12px 0 12px" : "12px 12px 12px 0",
              background: m.role === 'user' ? "#1a1464" : "white",
              color: m.role === 'user' ? "white" : "#374151",
              fontSize: "14px",
              lineHeight: "1.5",
              border: m.role === 'ai' ? "1px solid #e5e7eb" : "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              whiteSpace: "pre-line"
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic", marginLeft: "5px" }}>Processando análise técnica...</div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSearch} style={{ padding: "16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "10px", background: "white" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva a finalidade do ambiente..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            outline: "none",
            fontSize: "14px",
            color: "#1f2937"
          }}
        />
        <button type="submit" style={{
          background: "#1a1464",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "10px 16px",
          cursor: "pointer",
          transition: "background 0.2s"
        }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
