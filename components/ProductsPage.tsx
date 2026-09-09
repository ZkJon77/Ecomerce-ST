"use client"
import React, { useState } from "react"
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react"
import { Product, PRODUCTS, CATEGORIES, BRANDS } from "@/lib/constants"

const StarRow = ({ count = 5, size = 12 }: { count?: number; size?: number }) => (
  <div style={{ display: "flex", gap: 1 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </div>
)

const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

const ProductsPage = ({ onAdd, favorites, onToggleFavorite, initialCategory, searchQuery, setPage, onProductClick }: { onAdd: (p: Product) => void; favorites: number[]; onToggleFavorite: (id: number) => void; initialCategory?: string; searchQuery?: string; setPage: (p: string) => void; onProductClick: (id: number) => void }) => {
  const [selCat, setSelCat] = useState(initialCategory || "Todos")
  const [selBrand, setSelBrand] = useState("Todos")

  const filtered = PRODUCTS.filter(p => {
    const matchesCat = selCat === "Todos" || p.category === selCat;
    const matchesBrand = selBrand === "Todos" || p.brand === selBrand;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesBrand && matchesSearch;
  })

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Voltar para Home
        </button>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1464" }}>Nossos Produtos</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", padding: "16px", borderRadius: 12, border: "1px solid #eee" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Filtrar por Categoria:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setSelCat("Todos")} style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #ddd", background: selCat === "Todos" ? "#1a1464" : "white", color: selCat === "Todos" ? "white" : "#666", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>Todos</button>
              {CATEGORIES.map(c => (
                <button key={c.name} onClick={() => setSelCat(c.name)} style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #ddd", background: selCat === c.name ? "#1a1464" : "white", color: selCat === c.name ? "white" : "#666", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "white", padding: "16px", borderRadius: 12, border: "1px solid #eee" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase" }}>Filtrar por Marca:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setSelBrand("Todos")} style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #ddd", background: selBrand === "Todos" ? "#1a1464" : "white", color: selBrand === "Todos" ? "white" : "#666", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>Todas</button>
              {BRANDS.map(b => (
                <button key={b.name} onClick={() => setSelBrand(b.name)} style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #ddd", background: selBrand === b.name ? "#1a1464" : "white", color: selBrand === b.name ? "white" : "#666", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Nenhum produto encontrado com esses filtros.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {BRANDS.map(brand => {
            const brandProducts = filtered.filter(p => p.brand === brand.name);
            if (brandProducts.length === 0) return null;

            return (
              <div key={brand.name} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid #1a1464", paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1464", margin: 0 }}>{brand.name}</h2>
                  <span style={{ background: "#f0f4ff", color: "#1a1464", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #dbeafe" }}>{brandProducts.length} Produtos</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
                  {brandProducts.map(p => (
                    <div key={p.id} onClick={() => onProductClick(p.id)} style={{ background: "white", borderRadius: 16, border: "1px solid #eee", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

                      <div style={{ position: "relative", height: 200, background: "#f9f9f9" }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
                        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: "white", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: favorites.includes(p.id) ? "#ef4444" : "#999" }}>
                          <Heart size={16} fill={favorites.includes(p.id) ? "#ef4444" : "none"} />
                        </button>
                        {p.isBestSeller && (
                          <div style={{ position: "absolute", top: 12, left: 12, background: "#fbbf24", color: "#92400e", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Mais Vendido</div>
                        )}
                      </div>

                      <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                          <div style={{ fontSize: 12, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{p.brand}</div>
                          <StarRow count={p.stars} size={10} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8, height: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1464" }}>{fmt(p.price)}</div>
                          <button onClick={() => onAdd(p)} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
