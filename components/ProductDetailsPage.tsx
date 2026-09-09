"use client"
import React from "react"
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Droplets, Zap } from "lucide-react"
import { Product, PRODUCTS } from "@/lib/constants"

interface ProductDetailsPageProps {
  productId: number
  onAdd: (p: Product) => void
  setPage: (p: string) => void
}

const ProductDetailsPage = ({ productId, onAdd, setPage }: ProductDetailsPageProps) => {
  const product = PRODUCTS.find(p => p.id === productId)

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#666" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Produto não encontrado.</div>
        <button onClick={() => setPage("produtos")} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 8, background: "#1a1464", color: "white", border: "none", cursor: "pointer" }}>
          Voltar para Produtos
        </button>
      </div>
    )
  }

  const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

  return (
    <div style={{ padding: "40px 24px", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <button onClick={() => setPage("produtos")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Voltar para a lista
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
        {/* Left: Large Image */}
        <div style={{ background: "white", borderRadius: 24, padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 500 }}>
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: 500 }} />
        </div>

        {/* Right: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 }}>{product.brand}</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: "#1a1464", margin: 0, lineHeight: 1.2 }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < product.stars ? "#f59e0b" : "none"} color={i < product.stars ? "#f59e0b" : "#d1d5db"} />
                ))}
              </div>
              <span style={{ fontSize: 14, color: "#666", fontWeight: 500 }}>({product.stars}.0 / 5.0)</span>
            </div>
          </div>

          <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1464" }}>{fmt(product.price)}</div>

          <div style={{ background: "white", padding: "24px", borderRadius: 16, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 12 }}>Descrição do Produto</h3>
            <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6, margin: 0 }}>
              {product.description || "Este produto de alta qualidade oferece excelente acabamento e durabilidade para seu ambiente. Ideal para profissionais e entusiastas da pintura."}
            </p>
          </div>

          {/* Key Specs Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0f4ff", borderRadius: 12, border: "1px solid #dbeafe" }}>
              <Droplets size={20} color="#1a1464" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Cobertura</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464" }}>{product.coverage ? `${product.coverage}m²/L` : "Consulte embalagem"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0f4ff", borderRadius: 12, border: "1px solid #dbeafe" }}>
              <ShieldCheck size={20} color="#1a1464" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Garantia</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464" }}>1 Ano contra defeitos</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0f4ff", borderRadius: 12, border: "1px solid #dbeafe" }}>
              <Zap size={20} color="#1a1464" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Secagem</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464" }}>Rápida (4h ao toque)</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "#f0f4ff", borderRadius: 12, border: "1px solid #dbeafe" }}>
              <div style={{ fontSize: 20 }}>📦</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase" }}>Envio</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464" }}>Pronta Entrega</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onAdd(product)}
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "#1a1464",
              color: "white",
              border: "none",
              borderRadius: 16,
              padding: "20px",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(26,20,100,0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <ShoppingCart size={22} /> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
