"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Search, User, ShoppingCart, Paintbrush } from "lucide-react"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
  onGoHome: () => void
  onGoCor: () => void
  currentPage: string
  setPage: (p: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const Header = ({ cartCount, onCartOpen, onGoHome, onGoCor, currentPage, setPage, searchQuery, setSearchQuery }: HeaderProps) => {
  const router = useRouter()

  return (
    <header style={{ background: "#1a1464", padding: "0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "12px 32px", display: "flex", alignItems: "center", gap: 20 }}>
        <div onClick={onGoHome} style={{ cursor: "pointer", flexShrink: 0 }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 32, color: "white", lineHeight: 1, letterSpacing: "-1px" }}>Silver</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 3, textTransform: "uppercase" }}>tintas</div>
        </div>
        <div style={{ flex: 1, maxWidth: 600, background: "white", borderRadius: 6, display: "flex", alignItems: "center", padding: "8px 14px", gap: 8 }}>
          <Search size={16} color="#999" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tintas, ferramentas, marcas..."
            style={{ border: "none", outline: "none", fontSize: 14, color: "#333", width: "100%", background: "transparent" }}
          />
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {[
            { id: "home", label: "Início" },
            { id: "produtos", label: "Produtos" },
            { id: "kits", label: "Kits" },
            { id: "calculadora", label: "Calculadora" },
            { id: "simulador", label: "Simulador" },
            { id: "entrega", label: "Entrega" },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ background: "none", border: "none", color: currentPage === item.id ? "white" : "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: currentPage === item.id ? 700 : 500, cursor: "pointer", padding: "6px 12px", borderRadius: 6, borderBottom: currentPage === item.id ? "2px solid #fbbf24" : "2px solid transparent", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onGoCor}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "7px 16px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Paintbrush size={14} /> Consultar Cor
          </button>
          <User size={22} color="white" style={{ cursor: "pointer" }} onClick={() => router.push('/login')} />
          <div style={{ position: "relative", cursor: "pointer" }} onClick={onCartOpen}>
            <ShoppingCart size={22} color="white" />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -7, right: -7, background: "#e53e3e", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
