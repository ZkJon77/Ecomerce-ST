"use client";
import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Product, PRODUCTS } from "@/lib/constants";

interface FeaturedProductsProps {
  onAdd: (p: Product) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onProductClick: (id: number) => void;
}

const StarRow = ({ count = 5, size = 12 }: { count?: number; size?: number }) => (
  <div style={{ display: "flex", gap: 1 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </div>
);

const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

export default function FeaturedProducts({ onAdd, favorites, onToggleFavorite }: FeaturedProductsProps) {
  const bestSellers = PRODUCTS.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <section style={{ padding: "40px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1a1464" }}>Mais Vendidos</h2>
        <button onClick={() => window.location.href = "/produtos"} style={{ color: "#1a1464", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "none", border: "none" }}>Ver todos →</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
        {bestSellers.map(p => (
          <div key={p.id} onClick={() => onProductClick(p.id)} style={{ background: "white", borderRadius: 16, border: "1px solid #eee", overflow: "hidden", transition: "transform 0.2s", cursor: "pointer", position: "relative" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>

            <div style={{ position: "relative", height: 200, background: "#f9f9f9" }}>
              <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }} />
              <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: "white", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: favorites.includes(p.id) ? "#ef4444" : "#999" }}>
                <Heart size={16} fill={favorites.includes(p.id) ? "#ef4444" : "none"} />
              </button>
            </div>

            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{p.brand}</div>
                <StarRow count={p.stars} size={10} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>{p.name}</div>
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
    </section>
  );
}

