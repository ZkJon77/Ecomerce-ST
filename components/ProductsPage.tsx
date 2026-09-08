"use client"
import React, { useState } from "react"
import { Heart } from "lucide-react"
import { Product, PRODUCTS, CATEGORIES } from "@/lib/constants"

const StarRow = ({ count = 5, size = 12 }: { count?: number; size?: number }) => (
  <div style={{ display: "flex", gap: 1 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </div>
)

const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

const ProductsPage = ({ onAdd, favorites, onToggleFavorite, initialCategory, searchQuery }: { onAdd: (p: Product) => void; favorites: number[]; onToggleFavorite: (id: number) => void; initialCategory?: string; searchQuery?: string }) => {
  const [selCat, setSelCat] = useState(initialCategory || "Todos")

  const filtered = PRODUCTS.filter(p => {
    const matchesCat = selCat === "Todos" || p.category === selCat;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  })

  return (
    <div>Test</div>
  )
}

export default ProductsPage
