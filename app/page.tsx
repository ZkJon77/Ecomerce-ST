"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Search, User, ShoppingCart, ChevronRight, ChevronLeft,
  Check, Instagram, Facebook, MessageCircle, Heart, Paintbrush, Plus, Minus,
  Calculator, Package, Truck, Star, Layers, Droplets, Brush, ChevronDown, X, Upload, Palette, Zap,
  PaintBucket, Droplet, SprayCan, CirclePlus, Camera, Copy, Shuffle, LogOut, Lock
} from "lucide-react"
import Login from "./Login"
import { getSession, clearSession, SessionUser } from "./Cadastro"

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
  brand: string
  stars: number
  description?: string
  coverage?: number
}

interface CartItem extends Product {
  qty: number
}

interface ToastData {
  message: string
  type: "success" | "error" | "info"
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: 1, name: "Coral Rende Muito 18L", price: 259.90, imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg", category: "Tintas", brand: "Coral", stars: 5, coverage: 400, description: "Tinta acrílica fosco de alta cobertura e durabilidade." },
  { id: 2, name: "Suvinil Cor & Proteção 18L", price: 289.90, imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg", category: "Tintas", brand: "Suvinil", stars: 5, coverage: 380, description: "Tinta premium com proteção UV e resistência à umidade." },
  { id: 3, name: "Rolo de Pintura 23cm Atlas", price: 19.80, imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg", category: "Ferramentas para Pintura", brand: "Atlas", stars: 4, description: "Rolo de lã para aplicação uniforme." },
  { id: 4, name: "Acabamento Iquine 3,6L", price: 205.90, imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg", category: "Tintas", brand: "Iquine", stars: 4, coverage: 360, description: "Acabamento semibrilho resistente a limpeza." },
  { id: 5, name: "Tinta PU Automotiva Preto 3,6L", price: 189.90, imageUrl: "https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa", category: "Tintas", brand: "Coral", stars: 5, coverage: 320 },
  { id: 6, name: "Primer PU Cinza 3,6L", price: 149.90, imageUrl: "https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa", category: "Impermeabilizante", brand: "Suvinil", stars: 4, coverage: 280 },
  { id: 7, name: "Verniz PU Alto Brilho 900ml", price: 59.90, imageUrl: "https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg", category: "Sprays", brand: "Natrielli", stars: 5 },
  { id: 8, name: "Esmalte Sintético Branco 3,6L", price: 89.90, imageUrl: "https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg", category: "Tintas", brand: "Sherwin-Williams", stars: 5, coverage: 350 },
  // Accessories
  { id: 9, name: "Fita Crepe Profissional 48mm", price: 8.90, imageUrl: "https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg", category: "Acessórios", brand: "3M", stars: 5, description: "Fita crepe para acabamentos precisos." },
  { id: 10, name: "Massa Corrida PVA 25kg", price: 89.90, imageUrl: "https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg", category: "Acessórios", brand: "Suvinil", stars: 4, description: "Massa corrida para nivelamento de paredes." },
  { id: 11, name: "Bandeja para Rolo 23cm", price: 12.90, imageUrl: "https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg", category: "Ferramentas para Pintura", brand: "Atlas", stars: 4, description: "Bandeja plástica reforçada." },
  { id: 12, name: "Lona Plástica 4x4m", price: 24.90, imageUrl: "https://m.media-amazon.com/images/I/71Kl7e7y9ML._AC_SX679_.jpg", category: "Acessórios", brand: "Cortinas", stars: 4, description: "Proteção de piso e móveis durante pintura." },
]

const KITS = [
  {
    id: "quarto",
    name: "Kit Quarto Completo",
    icon: "🛏️",
    description: "Tudo para pintar um quarto de até 15m²",
    items: ["Tinta 18L", "Rolo 23cm", "Bandeja", "Fita Crepe", "Lona Plástica"],
    price: 349.90,
    originalPrice: 420.00,
    color: "#6366f1",
  },
  {
    id: "banheiro",
    name: "Kit Banheiro Anti-mofo",
    icon: "🚿",
    description: "Proteção contra umidade e mofo",
    items: ["Tinta Anti-Mofo 3,6L", "Pincel", "Fita Crepe", "Selador"],
    price: 229.90,
    originalPrice: 280.00,
    color: "#0ea5e9",
  },
  {
    id: "fachada",
    name: "Kit Fachada Premium",
    icon: "🏠",
    description: "Proteção máxima para área externa",
    items: ["Tinta Textura 25kg", "Rolo Médio", "Bandeja", "Primer", "Lona"],
    price: 479.90,
    originalPrice: 560.00,
    color: "#f59e0b",
  },
]

const COLOR_PALETTE = [
  { name: "Branco neve", hex: "#F5F5F0", group: "Branco" },
  { name: "Creme suave", hex: "#FDF6E3", group: "Bege" },
  { name: "Areia dourada", hex: "#D4B483", group: "Bege" },
  { name: "Cinza pérola", hex: "#C9C9C9", group: "Cinza" },
  { name: "Grafite urbano", hex: "#555555", group: "Cinza" },
  { name: "Azul sereno", hex: "#B8D4E8", group: "Azul" },
  { name: "Azul oceano", hex: "#2563EB", group: "Azul" },
  { name: "Azul marinho", hex: "#1E3A5F", group: "Azul" },
  { name: "Verde salvia", hex: "#A7C5A1", group: "Verde" },
  { name: "Verde musgo", hex: "#4A7C59", group: "Verde" },
  { name: "Verde oliva", hex: "#6B7A3E", group: "Verde" },
  { name: "Rosa blush", hex: "#F4C2C2", group: "Rosa" },
  { name: "Terracota", hex: "#C1705A", group: "Laranja" },
  { name: "Amarelo palha", hex: "#F0D080", group: "Amarelo" },
  { name: "Roxo lavanda", hex: "#C4B0D8", group: "Roxo" },
  { name: "Preto ônix", hex: "#1A1A1A", group: "Preto" },
]

const CATEGORIES = [
  { name: "Tintas", iconKey: "tintas" as const },
  { name: "Ferramentas para Pintura", iconKey: "ferramentas" as const },
  { name: "Impermeabilizante", iconKey: "impermeabilizante" as const },
  { name: "Sprays", iconKey: "sprays" as const },
  { name: "Outros", iconKey: "outros" as const },
]

const CATEGORY_CHIPS = ["Paredes internas", "Paredes externas", "Fosco", "Acetinado", "Semibrilho", "Brilhante"]

const BRANDS = [
  { name: "Coral", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Coral_Tintas_Logo.svg/320px-Coral_Tintas_Logo.svg.png" },
  { name: "Indutil", logo: null },
  { name: "Sherwin-Williams", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Sherwin-Williams_logo.svg/320px-Sherwin-Williams_logo.svg.png" },
  { name: "Suvinil", logo: null },
  { name: "Natrielli", logo: null },
  { name: "PPG", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/PPG_Industries_logo.svg/320px-PPG_Industries_logo.svg.png" },
]

const HERO_SLIDES = [
  { bg: "#1a1464", image: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg", brand: "Coral", title: "renova", sub: "Creme de Pintura" },
  { bg: "#0d4a1a", image: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg", brand: "Suvinil", title: "Cor & Proteção", sub: "Interior e Exterior" },
]

const fmt = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`

const StarRow = ({ count = 5, size = 12 }: { count?: number; size?: number }) => (
  <div style={{ display: "flex", gap: 1 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </div>
)

// ─── HEADER ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
  onGoHome: () => void
  onGoCor: () => void
  currentPage: string
  setPage: (p: string) => void
  user: SessionUser | null
  onOpenAuth: () => void
  onLogout: () => void
}

const MENU_LINKS = [
  { id: "home", label: "Início" },
  { id: "produtos", label: "Produtos" },
  { id: "kits", label: "Kits" },
  { id: "calculadora", label: "Calculadora" },
  { id: "simulador", label: "Simulador de Cores" },
  { id: "cor", label: "Consultar Cor" },
  { id: "entrega", label: "Entrega & Retirada" },
]

const Header = ({ cartCount, onCartOpen, onGoHome, currentPage, setPage, user, onOpenAuth, onLogout }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  return (
    <header style={{ background: "#1a1464", padding: "12px 16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ width: 20, height: 2, background: "white" }} />
          <div style={{ width: 20, height: 2, background: "white" }} />
          <div style={{ width: 20, height: 2, background: "white" }} />
        </button>
        <div onClick={onGoHome} style={{ cursor: "pointer" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 26, color: "white", lineHeight: 1, letterSpacing: "-1px" }}>Silver</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>tintas</div>
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: 8, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8, border: "1px solid rgba(255,255,255,0.4)" }}>
          <Search size={15} color="#999" />
          <span style={{ fontSize: 12, color: "#bbb" }}>buscar...</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => (user ? setUserMenuOpen(o => !o) : onOpenAuth())}
              aria-label={user ? "Minha conta" : "Entrar"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            >
              {user ? (
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fbbf24", color: "#1a1464", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user.name.trim().charAt(0).toUpperCase()}
                </div>
              ) : (
                <User size={20} color="white" />
              )}
            </button>

            {userMenuOpen && user && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 149 }} />
                <div style={{ position: "absolute", top: 32, right: 0, background: "white", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.22)", padding: 10, minWidth: 190, zIndex: 150 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1464", padding: "4px 8px 2px" }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: "#999", padding: "0 8px 8px", borderBottom: "1px solid #f0f0f0", marginBottom: 6 }}>{user.email}</div>
                  <button
                    onClick={() => { setUserMenuOpen(false); onLogout() }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: "#dc2626", fontSize: 12, fontWeight: 700, padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, borderRadius: 6 }}
                  >
                    <LogOut size={13} /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={onCartOpen}>
            <ShoppingCart size={20} color="white" />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, background: "#e53e3e", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div style={{ marginTop: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
          {MENU_LINKS.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false) }}
              style={{ display: "block", width: "100%", textAlign: "left", background: currentPage === item.id ? "rgba(255,255,255,0.12)" : "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)", color: currentPage === item.id ? "#fbbf24" : "white", fontSize: 13, fontWeight: currentPage === item.id ? 700 : 500, padding: "11px 14px", cursor: "pointer" }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

// ─── HERO CAROUSEL ────────────────────────────────────────────────────────────

const HeroCarousel = () => {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 3500)
    return () => clearInterval(t)
  }, [])
  const slide = HERO_SLIDES[idx]
  return (
    <div style={{ position: "relative", background: slide.bg, overflow: "hidden", minHeight: 200, display: "flex", alignItems: "center", transition: "background 0.5s" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${slide.bg} 40%, rgba(255,255,255,0.05) 100%)` }} />
      <div style={{ position: "relative", zIndex: 2, flex: 1, padding: "20px 16px" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>{slide.brand}</div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 36, fontWeight: 900, color: "white", lineHeight: 1 }}>{slide.title}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{slide.sub}</div>
      </div>
      <div style={{ position: "relative", zIndex: 2, padding: "10px 10px 10px 0" }}>
        <img src={slide.image} alt={slide.title} style={{ height: 160, width: 130, objectFit: "contain", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} />
      </div>
      <button onClick={() => setIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3 }}>
        <ChevronLeft size={16} color="white" />
      </button>
      <button onClick={() => setIdx(i => (i + 1) % HERO_SLIDES.length)}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3 }}>
        <ChevronRight size={16} color="white" />
      </button>
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 3 }}>
        {HERO_SLIDES.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? "white" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
    </div>
  )
}

// ─── QUICK FEATURES STRIP ─────────────────────────────────────────────────────

const QuickFeatures = ({ setPage }: { setPage: (p: string) => void }) => (
  <div style={{ background: "#1a1464", padding: "12px 8px", display: "flex", justifyContent: "space-around" }}>
    {[
      { icon: <Calculator size={18} color="#fbbf24" />, label: "Calculadora", page: "calculadora" },
      { icon: <Palette size={18} color="#fbbf24" />, label: "Simulador", page: "simulador" },
      { icon: <Package size={18} color="#fbbf24" />, label: "Kits", page: "kits" },
      { icon: <Truck size={18} color="#fbbf24" />, label: "Entrega", page: "entrega" },
    ].map(item => (
      <button key={item.page} onClick={() => setPage(item.page)}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {item.icon}
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{item.label}</span>
      </button>
    ))}
  </div>
)

// ─── CATEGORIES GRID ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  tintas: <PaintBucket size={24} color="#4a4f7a" />,
  ferramentas: <Paintbrush size={24} color="#4a4f7a" />,
  impermeabilizante: <Droplet size={24} color="#4a4f7a" />,
  sprays: <SprayCan size={24} color="#4a4f7a" />,
  outros: <CirclePlus size={24} color="#4a4f7a" />,
}

const CategoriesGrid = ({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) => (
  <div style={{ background: "white", padding: "24px 16px" }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 18, color: "#222" }}>O que procura?</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {CATEGORIES.map(cat => (
        <div key={cat.name} onClick={() => onCategoryClick(cat.name)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#c3c9dd", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {CATEGORY_ICONS[cat.iconKey]}
          </div>
          <span style={{ fontSize: 9, color: "#222", textAlign: "center", fontWeight: 700, textTransform: "uppercase", lineHeight: 1.2 }}>{cat.name}</span>
        </div>
      ))}
    </div>
  </div>
)

// ─── FEATURED PRODUCTS ────────────────────────────────────────────────────────

const FeaturedProducts = ({ onAdd, favorites, onToggleFavorite }: { onAdd: (p: Product) => void; favorites: number[]; onToggleFavorite: (id: number) => void }) => {
  const featured = PRODUCTS.slice(0, 4)
  return (
    <div style={{ background: "#fff", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1464", textAlign: "center", marginBottom: 18 }}>Mais Vendidos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {featured.map(p => (
          <div key={p.id} style={{ background: "white", borderRadius: 8, border: "1px solid #eceef3", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ background: "#fff", padding: 12, position: "relative", textAlign: "center" }}>
              <img src={p.imageUrl} alt={p.name} style={{ height: 100, width: "100%", objectFit: "contain" }} />
              <button onClick={() => onToggleFavorite(p.id)}
                style={{ position: "absolute", top: 8, right: 8, background: favorites.includes(p.id) ? "#ef4444" : "white", border: "1px solid #ddd", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Heart size={13} color={favorites.includes(p.id) ? "white" : "#999"} fill={favorites.includes(p.id) ? "white" : "none"} />
              </button>
            </div>
            <div style={{ padding: "0 10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#666", lineHeight: 1.3, marginBottom: 6, minHeight: 28 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>{fmt(p.price)}</span>
                <StarRow count={p.stars} size={10} />
              </div>
              <button onClick={() => onAdd(p)} style={{ width: "100%", background: "#1a1464", color: "white", border: "none", borderRadius: 6, padding: "9px 0", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, cursor: "pointer" }}>
                COMPRAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── KITS PAGE ────────────────────────────────────────────────────────────────

const KitsPage = ({ onAddKit }: { onAddKit: (name: string, price: number) => void }) => (
  <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
    <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2d3a8c 100%)", padding: "24px 16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Package size={22} color="#fbbf24" />
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Kits de Pintura</h1>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>Kits completos para cada ambiente. Economize e comece a pintar hoje!</p>
    </div>

    <div style={{ padding: "16px" }}>
      {KITS.map(kit => {
        const discount = Math.round((1 - kit.price / kit.originalPrice) * 100)
        return (
          <div key={kit.id} style={{ background: "white", borderRadius: 14, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
            <div style={{ background: kit.color, padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 36 }}>{kit.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{kit.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{kit.description}</div>
              </div>
              <div style={{ marginLeft: "auto", background: "#ef4444", borderRadius: 8, padding: "4px 8px", fontSize: 12, fontWeight: 800, color: "white" }}>
                -{discount}%
              </div>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Inclui:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {kit.items.map(item => (
                    <span key={item} style={{ background: "#f0f4ff", color: "#1a1464", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                      <Check size={10} /> {item}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#999", textDecoration: "line-through" }}>{fmt(kit.originalPrice)}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1464" }}>{fmt(kit.price)}</div>
                  <div style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>ou 6x de {fmt(kit.price / 6)} s/juros</div>
                </div>
                <button onClick={() => onAddKit(kit.name, kit.price)}
                  style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  Adicionar Kit
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

// ─── PAINT CALCULATOR PAGE ────────────────────────────────────────────────────

const CalculatorPage = () => {
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [coats, setCoats] = useState(2)
  const [doors, setDoors] = useState(1)
  const [windows, setWindows] = useState(1)
  const [coverage, setCoverage] = useState(400)
  const [result, setResult] = useState<{ area: number; cans18L: number; cans36L: number; liters: number } | null>(null)

  const calculate = () => {
    const w = parseFloat(width)
    const h = parseFloat(height)
    if (!w || !h) return
    const totalArea = w * h * 4  // 4 paredes simplificado
    const doorArea = doors * 2.1
    const windowArea = windows * 1.2
    const netArea = Math.max(0, totalArea - doorArea - windowArea)
    const liters = (netArea / coverage) * coats * 3.6  // convert to 3.6L equivalents
    const litersTotal = (netArea / coverage) * coats
    const cans18L = Math.ceil(litersTotal * 18 / 18)
    const cans36L = Math.ceil(litersTotal * 18 / 3.6)
    setResult({ area: Math.round(netArea * 10) / 10, cans18L, cans36L, liters: Math.round(litersTotal * 10) / 10 })
  }

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Calculator size={22} color="#34d399" />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Calculadora de Tinta</h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>Calcule exatamente quanto tinta você precisa. Sem desperdício!</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Room input */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 14 }}>📐 Dimensões do Ambiente</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Largura (m)</label>
              <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="Ex: 4.0"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Comprimento (m)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Ex: 5.0"
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>🪟 Descontar aberturas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Portas</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setDoors(Math.max(0, doors - 1))} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{doors}</span>
                <button onClick={() => setDoors(doors + 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Janelas</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setWindows(Math.max(0, windows - 1))} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{windows}</span>
                <button onClick={() => setWindows(windows + 1)} style={{ width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Número de demãos: <strong style={{ color: "#1a1464" }}>{coats}</strong></label>
            <input type="range" min={1} max={3} value={coats} onChange={e => setCoats(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#1a1464" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999" }}>
              <span>1 demão</span><span>2 demãos (rec.)</span><span>3 demãos</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Rendimento da tinta (m²/L)</label>
            <select value={coverage} onChange={e => setCoverage(Number(e.target.value))}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 13, background: "white", outline: "none" }}>
              <option value={280}>Baixo rendimento – 280 m²/18L</option>
              <option value={350}>Médio rendimento – 350 m²/18L</option>
              <option value={400}>Alto rendimento – 400 m²/18L (padrão)</option>
              <option value={450}>Premium – 450 m²/18L</option>
            </select>
          </div>

          <button onClick={calculate}
            style={{ width: "100%", background: "linear-gradient(135deg, #064e3b, #065f46)", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            🧮 Calcular
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "2px solid #059669" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#059669", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={18} /> Resultado do cálculo
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Área líquida", value: `${result.area} m²`, icon: "📐" },
                { label: "Total de tinta", value: `${result.liters} litros`, icon: "🪣" },
                { label: "Latas de 18L", value: `${result.cans18L} lata(s)`, icon: "📦" },
                { label: "Galões de 3,6L", value: `${result.cans36L} galão(ões)`, icon: "🔵" },
              ].map(item => (
                <div key={item.label} style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 10px", textAlign: "center", border: "1px solid #86efac" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1464" }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#78350f" }}>
              💡 Recomendamos comprar 10% a mais para retoques futuros. Fórmula: Área ÷ Rendimento ÷ Nº de demãos.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── COLOR WHEEL ENGINE (estilo Adobe Color) ──────────────────────────────────

interface Swatch { hue: number; sat: number; light: number }

const hslToHex = (h: number, s: number, l: number) => {
  h = ((h % 360) + 360) % 360
  const sN = Math.max(0, Math.min(100, s)) / 100
  const lN = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lN - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

const HARMONIES: { id: string; label: string; offsets: number[] | null }[] = [
  { id: "custom", label: "Livre", offsets: null },
  { id: "complementar", label: "Complementar", offsets: [0, 180] },
  { id: "analoga", label: "Análoga", offsets: [-30, 0, 30] },
  { id: "triadica", label: "Triádica", offsets: [0, 120, 240] },
  { id: "quadrado", label: "Quadrado", offsets: [0, 90, 180, 270] },
  { id: "split", label: "Split", offsets: [0, 150, 210] },
  { id: "monocromatica", label: "Monocromática", offsets: [0] },
]

const LIGHT_STEPS = [30, 45, 58, 70, 40]
const WHEEL_SIZE = 232

const buildPalette = (baseHue: number, baseSat: number, harmonyId: string): Swatch[] => {
  const h = HARMONIES.find(x => x.id === harmonyId) || HARMONIES[1]
  const offsets = h.offsets && h.offsets.length ? h.offsets : [0]
  return Array.from({ length: 5 }).map((_, i) => ({
    hue: (baseHue + offsets[i % offsets.length] + 360) % 360,
    sat: baseSat,
    light: LIGHT_STEPS[i],
  }))
}

const HarmonyIcon = ({ offsets, active }: { offsets: number[] | null; active: boolean }) => {
  const dots = offsets === null ? [0, 72, 144, 216, 288] : (offsets.length ? offsets : [0])
  return (
    <svg width="20" height="20" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" fill="none" stroke={active ? "#6d28d9" : "#d1d5db"} strokeWidth="1.4" />
      {dots.map((o, i) => {
        const rad = (o * Math.PI) / 180
        return <circle key={i} cx={11 + 8 * Math.sin(rad)} cy={11 - 8 * Math.cos(rad)} r={offsets === null ? 1.8 : 2.2} fill={active ? "#6d28d9" : "#9ca3af"} />
      })}
    </svg>
  )
}

// ─── COLOR SIMULATOR PAGE ─────────────────────────────────────────────────────

const SimulatorPage = () => {
  const [harmony, setHarmony] = useState("complementar")
  const [baseHue, setBaseHue] = useState(222)
  const [baseSat, setBaseSat] = useState(68)
  const [swatches, setSwatches] = useState<Swatch[]>(() => buildPalette(222, 68, "complementar"))
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedHex, setSelectedHex] = useState<string>(hslToHex(222, 68, 30))
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [paletteName, setPaletteName] = useState("Meu Ambiente")
  const wheelRef = useRef<HTMLDivElement>(null)
  const draggingIdx = useRef<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (harmony !== "custom") setSwatches(buildPalette(baseHue, baseSat, harmony))
  }, [harmony, baseHue, baseSat])

  useEffect(() => {
    const s = swatches[activeIdx] || swatches[0]
    if (s) setSelectedHex(hslToHex(s.hue, s.sat, s.light))
  }, [swatches, activeIdx])

  const updateFromPoint = useCallback((clientX: number, clientY: number, idx: number) => {
    const el = wheelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const maxR = rect.width / 2
    const r = Math.min(Math.sqrt(dx * dx + dy * dy), maxR)
    let theta = (Math.atan2(dx, -dy) * 180) / Math.PI
    if (theta < 0) theta += 360
    const sat = Math.round((r / maxR) * 100)
    if (harmony === "custom") {
      setSwatches(prev => prev.map((s, i) => (i === idx ? { ...s, hue: theta, sat } : s)))
    } else {
      setBaseHue(theta)
      setBaseSat(sat)
    }
  }, [harmony])

  const startDrag = (idx: number) => (e: React.PointerEvent) => {
    e.stopPropagation()
    setActiveIdx(idx)
    draggingIdx.current = idx
    updateFromPoint(e.clientX, e.clientY, idx)
    const move = (ev: PointerEvent) => { if (draggingIdx.current !== null) updateFromPoint(ev.clientX, ev.clientY, draggingIdx.current) }
    const stop = () => {
      draggingIdx.current = null
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  const handleWheelBackgroundDown = (e: React.PointerEvent) => {
    const idx = harmony === "custom" ? activeIdx : 0
    startDrag(idx)(e)
  }

  const randomize = () => {
    const h = Math.round(Math.random() * 360)
    const s = 40 + Math.round(Math.random() * 55)
    if (harmony === "custom") {
      const offsets = [0, 30, 90, 180, 260]
      setSwatches(offsets.map((o, i) => ({ hue: (h + o) % 360, sat: s, light: LIGHT_STEPS[i] })))
    } else {
      setBaseHue(h)
      setBaseSat(s)
    }
  }

  const copyHex = (hex: string, idx: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {})
    }
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1200)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const markerPos = (hue: number, sat: number) => {
    const rPx = (sat / 100) * (WHEEL_SIZE / 2)
    const rad = (hue * Math.PI) / 180
    return { x: WHEEL_SIZE / 2 + rPx * Math.sin(rad), y: WHEEL_SIZE / 2 - rPx * Math.cos(rad) }
  }

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Palette size={22} color="#c4b5fd" />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Simulador de Cores</h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>Monte sua paleta na roda de cores e visualize no ambiente antes de comprar.</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Room preview */}
        <div style={{ background: "white", borderRadius: 14, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ position: "relative", height: 190, background: "#e5e7eb" }}>
            {uploadedImage ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img src={uploadedImage} alt="Ambiente" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: selectedHex, opacity: 0.45, mixBlendMode: "multiply" }} />
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: selectedHex, transition: "background 0.25s" }}>
                <div style={{ background: "rgba(0,0,0,0.14)", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🏠</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>Prévia da cor</div>
                  <div style={{ fontSize: 14, color: "white", fontWeight: 800, marginTop: 2 }}>{selectedHex}</div>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>Cor selecionada</div>
              <div style={{ fontSize: 11, color: "#888" }}>{selectedHex}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => fileRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", background: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#333" }}>
                <Upload size={14} /> Upload
              </button>
              {uploadedImage && (
                <button onClick={() => setUploadedImage(null)}
                  style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 10px", background: "#fff5f5", cursor: "pointer", color: "#ef4444" }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
          </div>
        </div>

        {/* Color wheel card */}
        <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>Roda de cores</div>
            <button onClick={randomize}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 20, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "#6d28d9", cursor: "pointer" }}>
              <Shuffle size={12} /> Aleatório
            </button>
          </div>

          {/* Harmony chips */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 4 }}>
            {HARMONIES.map(h => (
              <button key={h.id}
                onClick={() => { setHarmony(h.id); if (h.id === "custom") setSwatches(buildPalette(baseHue, baseSat, "complementar")) }}
                style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: harmony === h.id ? "#f5f3ff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", border: harmony === h.id ? "1.5px solid #6d28d9" : "1.5px solid transparent" }}>
                  <HarmonyIcon offsets={h.offsets} active={harmony === h.id} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: harmony === h.id ? "#6d28d9" : "#888", whiteSpace: "nowrap" }}>{h.label}</span>
              </button>
            ))}
          </div>

          {/* Wheel */}
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <div
              ref={wheelRef}
              onPointerDown={handleWheelBackgroundDown}
              style={{
                position: "relative",
                width: WHEEL_SIZE,
                height: WHEEL_SIZE,
                borderRadius: "50%",
                background: "conic-gradient(from 0deg, #ff0000, #ffea00, #22c55e, #06b6d4, #2563eb, #d946ef, #ff0000)",
                boxShadow: "0 2px 14px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)",
                cursor: "pointer",
                touchAction: "none",
                userSelect: "none",
              }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0) 72%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", width: 6, height: 6, borderRadius: "50%", background: "#00000022", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />

              {swatches.map((s, i) => {
                const isMain = harmony === "custom" ? i === activeIdx : i === 0
                const pos = markerPos(s.hue, s.sat)
                const hex = hslToHex(s.hue, s.sat, s.light)
                const interactive = harmony === "custom" || i === 0
                return (
                  <div key={i}
                    onPointerDown={interactive ? startDrag(i) : undefined}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      width: isMain ? 24 : 15,
                      height: isMain ? 24 : 15,
                      borderRadius: "50%",
                      background: hex,
                      border: isMain ? "3px solid white" : "2px solid white",
                      boxShadow: isMain ? "0 0 0 1.5px #1a1464, 0 2px 6px rgba(0,0,0,0.35)" : "0 1px 4px rgba(0,0,0,0.3)",
                      transform: "translate(-50%,-50%)",
                      cursor: interactive ? "grab" : "default",
                      zIndex: isMain ? 3 : 2,
                      touchAction: "none",
                    }} />
                )
              })}
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#999", marginTop: 4 }}>
            {harmony === "custom" ? "Toque numa cor da paleta abaixo e arraste na roda para ajustá-la" : "Arraste o marcador principal para escolher o tom base"}
          </div>
        </div>

        {/* Palette strip */}
        <div style={{ background: "white", borderRadius: 14, padding: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <input value={paletteName} onChange={e => setPaletteName(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 800, color: "#1a1464", background: "transparent", width: "100%", marginBottom: 10, padding: 0 }} />
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #eceef3" }}>
            {swatches.map((s, i) => {
              const hex = hslToHex(s.hue, s.sat, s.light)
              const isActive = i === activeIdx
              const dark = s.light > 55
              return (
                <div key={i} onClick={() => setActiveIdx(i)}
                  style={{ flex: 1, minHeight: 78, background: hex, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "6px 5px", cursor: "pointer", boxSizing: "border-box", border: isActive ? "2px solid #1a1464" : "2px solid transparent" }}>
                  <button onClick={e => { e.stopPropagation(); copyHex(hex, i) }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: dark ? "#00000099" : "#ffffffcc" }}>{copiedIdx === i ? "Copiado!" : hex}</span>
                    <Copy size={10} color={dark ? "#00000066" : "#ffffffaa"} />
                  </button>
                </div>
              )
            })}
          </div>
          <button onClick={() => copyHex(swatches.map(s => hslToHex(s.hue, s.sat, s.light)).join(", "), -1)}
            style={{ width: "100%", marginTop: 10, background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Copy size={13} /> {copiedIdx === -1 ? "Paleta copiada!" : "Copiar paleta (hex)"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DELIVERY PAGE ────────────────────────────────────────────────────────────

const DeliveryPage = () => {
  const [mode, setMode] = useState<"delivery" | "pickup" | null>(null)
  const [cep, setCep] = useState("")
  const [result, setResult] = useState<{ days: number; price: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const checkDelivery = () => {
    if (cep.length < 8) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResult({ days: 2, price: cep.startsWith("130") ? "Grátis" : "R$ 24,90" })
    }, 1200)
  }

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", padding: "24px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Truck size={22} color="#e9d5ff" />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Entrega & Retirada</h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0 }}>Entregamos em toda Campinas e região. Ou retire na loja!</p>
      </div>

      <div style={{ padding: 16 }}>
        {/* Mode selection */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { id: "delivery" as const, icon: "🚚", title: "Entrega em Casa", desc: "Receba no conforto do seu lar" },
            { id: "pickup" as const, icon: "🏪", title: "Retire na Loja", desc: "Pronto em até 2 horas" },
          ].map(opt => (
            <button key={opt.id} onClick={() => setMode(opt.id)}
              style={{ background: mode === opt.id ? "#1a1464" : "white", border: mode === opt.id ? "none" : "1px solid #e5e7eb", borderRadius: 12, padding: "16px 12px", cursor: "pointer", textAlign: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: mode === opt.id ? "white" : "#1a1464", marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 10, color: mode === opt.id ? "rgba(255,255,255,0.7)" : "#888" }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        {mode === "delivery" && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Calcule o frete</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={cep} onChange={e => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="CEP (ex: 13056000)"
                style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              <button onClick={checkDelivery}
                style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {loading ? "..." : "OK"}
              </button>
            </div>
            {result && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📅</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>{result.days} dias úteis</div>
                  <div style={{ fontSize: 10, color: "#666" }}>Prazo estimado</div>
                </div>
                <div style={{ background: result.price === "Grátis" ? "#f0fdf4" : "#fff7ed", border: `1px solid ${result.price === "Grátis" ? "#86efac" : "#fed7aa"}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{result.price === "Grátis" ? "🎉" : "💳"}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1464" }}>{result.price}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>Frete</div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "pickup" && (
          <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Nossa loja</h3>
            <div style={{ background: "#f0f4ff", borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1464", marginBottom: 4 }}>Silver Tintas</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                Av. Arymana, 299B<br />
                Parque Universitário de Viracopos<br />
                Campinas – SP, 13056-464
              </div>
              <div style={{ fontSize: 12, color: "#1a1464", fontWeight: 600, marginTop: 6 }}>📞 (19) 3266-0789</div>
            </div>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#78350f" }}>
              ⏱️ Pedido pronto para retirada em até 2 horas após confirmação.
            </div>
          </div>
        )}

        {/* Shipping info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "🚚", title: "Frete Grátis", desc: "Compras acima de R$ 400 em Campinas" },
            { icon: "📦", title: "Embalagem", desc: "Produtos 100% seguros para transporte" },
            { icon: "🔄", title: "Troca fácil", desc: "7 dias para troca ou devolução" },
            { icon: "💳", title: "Parcelamento", desc: "Até 6x sem juros no cartão" },
          ].map(item => (
            <div key={item.title} style={{ background: "white", borderRadius: 10, padding: "12px 10px", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1464", marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────

const CategorySection = ({ onCategoryClick }: { onCategoryClick: (label: string) => void }) => {
  const [active, setActive] = useState(CATEGORY_CHIPS[0])
  return (
    <div style={{ background: "white", padding: "24px 16px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#222", textAlign: "center", marginBottom: 18 }}>Categoria de Tintas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 480, margin: "0 auto" }}>
        {CATEGORY_CHIPS.map(label => {
          const isActive = active === label
          return (
            <button key={label} onClick={() => { setActive(label); onCategoryClick(label) }}
              style={{ padding: "9px 8px", borderRadius: 20, border: isActive ? "1.5px solid #222" : "1px solid #d1d5db", background: "white", color: isActive ? "#222" : "#999", fontSize: 11, fontWeight: isActive ? 700 : 500, cursor: "pointer" }}>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── STORE BANNER ─────────────────────────────────────────────────────────────

const StoreBanner = () => (
  <div style={{ background: "white", padding: "8px 16px 20px" }}>
    <div style={{ textAlign: "right", fontSize: 17, fontWeight: 800, color: "#222", marginBottom: 12, lineHeight: 1.3 }}>
      conheça nossa<br />loja física
    </div>
    <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 150, background: "#1a88d4", position: "relative", overflow: "hidden" }}>
        <img src="https://lh5.googleusercontent.com/p/AF1QipME5Ys4k0HB0q2f4I1H3HlFEXVFhqNGTTNGMJg=w426-h240-k-no" alt="Loja Silver Tintas"
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
      </div>
      <div style={{ flex: 1.2, background: "#1a1464", padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>Av. Arymana, 299B – Parque Universitário de Viracopos<br />Campinas – SP, 13056-464</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginTop: 8, fontWeight: 700 }}>Telefone: (19) 3266-0789</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 8, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "white" }}>Horário de funcionamento:</span><br />
          Seg a Sex 8:00 as 18:00<br />
          Sábado 8:00 as 12:00<br />
          Domingo: Fechado
        </div>
      </div>
    </div>
  </div>
)

// ─── COLOR BANNER ─────────────────────────────────────────────────────────────

const ColorBanner = ({ setPage }: { setPage: (p: string) => void }) => (
  <div style={{ margin: "0 12px 16px", borderRadius: 14, overflow: "hidden", background: "linear-gradient(135deg, #cfe0ea, #aec4d8)", position: "relative", cursor: "pointer" }}
    onClick={() => setPage("simulador")}>
    <button onClick={e => { e.stopPropagation(); setPage("cor") }}
      style={{ position: "absolute", top: 10, right: 10, background: "white", border: "none", borderRadius: 20, padding: "5px 10px", fontSize: 9, fontWeight: 600, color: "#333", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
      <Camera size={11} /> busque seu tom
    </button>
    <div style={{ display: "flex", alignItems: "center", padding: "18px 14px 14px", gap: 4 }}>
      <div style={{ width: 54, height: 82, flexShrink: 0, borderRadius: 8, border: "3px solid #b23a3a", overflow: "hidden", background: "#8a3a3a", zIndex: 2 }}>
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&q=60" alt="Ambiente pintado"
          style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
      </div>
      <div style={{ width: 76, height: 76, flexShrink: 0, marginLeft: -18 }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          {[
            { color: "#e53e3e", d: "M50,50 L50,10 A40,40 0 0,1 84,30 Z" },
            { color: "#ed8936", d: "M50,50 L84,30 A40,40 0 0,1 90,50 Z" },
            { color: "#ecc94b", d: "M50,50 L90,50 A40,40 0 0,1 84,70 Z" },
            { color: "#48bb78", d: "M50,50 L84,70 A40,40 0 0,1 50,90 Z" },
            { color: "#38b2ac", d: "M50,50 L50,90 A40,40 0 0,1 16,70 Z" },
            { color: "#4299e1", d: "M50,50 L16,70 A40,40 0 0,1 10,50 Z" },
            { color: "#805ad5", d: "M50,50 L10,50 A40,40 0 0,1 16,30 Z" },
            { color: "#e53e3e", d: "M50,50 L16,30 A40,40 0 0,1 50,10 Z" },
          ].map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
          <circle cx="50" cy="50" r="12" fill="#dfe7ee" />
        </svg>
      </div>
      <div style={{ flex: 1, paddingLeft: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#14306b", lineHeight: 1.25 }}>escolha a cor ideal para seu ambiente</div>
      </div>
    </div>
    <div style={{ background: "rgba(50,60,75,0.75)", padding: "8px 14px", fontSize: 10, color: "white", fontStyle: "italic", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>Sua criatividade começa aqui, explore nossas cores.</span>
      <ChevronRight size={16} color="white" />
    </div>
  </div>
)

// ─── BRANDS SECTION ───────────────────────────────────────────────────────────

const BrandsSection = () => (
  <div style={{ background: "white", padding: "20px 16px 24px" }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 16, color: "#222", letterSpacing: 1, textTransform: "uppercase" }}>Procure por Marcas</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {BRANDS.map(brand => (
        <div key={brand.name} style={{ border: "1px solid #e5e7eb", borderRadius: 8, height: 56, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 12px", cursor: "pointer", background: "white" }}>
          {brand.logo ? (
            <img src={brand.logo} alt={brand.name} style={{ maxHeight: 30, maxWidth: "100%", objectFit: "contain" }}
              onError={e => { const img = e.target as HTMLImageElement; img.style.display = "none"; const s = img.nextSibling as HTMLElement | null; if (s) s.style.display = "block" }} />
          ) : null}
          <span style={{ fontSize: 11, fontWeight: 700, color: "#333", display: brand.logo ? "none" : "block" }}>{brand.name}</span>
        </div>
      ))}
    </div>
  </div>
)

// ─── TIPS SECTION ─────────────────────────────────────────────────────────────

const TipsSection = () => {
  const tips = [
    { icon: "🖌️", title: "Fosco, Acetinado ou Semibrilho?", desc: "Fosco esconde imperfeições; semibrilho é lavável; acetinado equilibra os dois." },
    { icon: "💧", title: "Áreas úmidas", desc: "Use tinta antimofo em banheiros e cozinhas. Sempre aplique selador antes." },
    { icon: "☀️", title: "Pintando fachadas", desc: "Escolha tintas com proteção UV para garantir durabilidade de 5+ anos." },
    { icon: "🧹", title: "Preparação é tudo", desc: "Lixe, aplique massa corrida e fundo preparador antes de pintar. O resultado faz diferença!" },
  ]
  return (
    <div style={{ background: "#1a1464", padding: "20px 16px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap size={18} color="#fbbf24" />
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0 }}>Dicas dos especialistas</h2>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {tips.map(tip => (
          <div key={tip.title} style={{ flexShrink: 0, width: 180, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "white", marginBottom: 6, lineHeight: 1.2 }}>{tip.title}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{tip.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer style={{ background: "#0f0c38", color: "white", padding: "22px 16px 16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 22, color: "white", lineHeight: 1 }}>Silver</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>tintas</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Qualidade que pinta confiança.</div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="https://wa.me/5519326607089" target="_blank" rel="noreferrer" style={{ color: "white", display: "flex", textDecoration: "none" }}>
            <MessageCircle size={16} color="white" />
          </a>
          <Instagram size={16} color="white" style={{ cursor: "pointer" }} />
          <Facebook size={16} color="white" style={{ cursor: "pointer" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Institucional</div>
          {["Sobre nós", "Loja", "Contato"].map(l => (<div key={l} style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 5, cursor: "pointer", textAlign: "center" }}>{l}</div>))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>Atendimento</div>
          {["Central de ajuda", "Política de trocas", "Envio e entregas"].map(l => (<div key={l} style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 5, cursor: "pointer", textAlign: "center" }}>{l}</div>))}
        </div>
      </div>
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 16, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
      © 2026 Silver Tintas · Av. Arymana, 299B · Campinas – SP · (19) 3266-0789
    </div>
  </footer>
)

// ─── COLOR PAGE ───────────────────────────────────────────────────────────────

const ColorPage = () => {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const handleSearch = () => {
    if (!code) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setResult(`Cor encontrada para ${code}: Preto Metálico`) }, 1200)
  }
  return (
    <div style={{ padding: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #2a52be 100%)", borderRadius: 12, padding: "20px 16px", marginBottom: 16, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Paintbrush size={24} color="#fbbf24" />
          <div style={{ fontSize: 18, fontWeight: 800 }}>Consultar Cor</div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Digite o código da peça do veículo para encontrar a tinta correta.</p>
      </div>
      <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 8 }}>Código da cor</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: NH731P"
            style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <button onClick={handleSearch} style={{ background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "..." : "Buscar"}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 12, padding: 12, background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 8, fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={18} /> {result}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────

const ProductsPage = ({ onAdd, favorites, onToggleFavorite, initialCategory }: { onAdd: (p: Product) => void; favorites: number[]; onToggleFavorite: (id: number) => void; initialCategory?: string }) => {
  const [selCat, setSelCat] = useState(initialCategory || "Todos")
  const filtered = selCat === "Todos" ? PRODUCTS : PRODUCTS.filter(p => p.category === selCat)
  const cats = ["Todos", ...CATEGORIES.map(c => c.name)]

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh" }}>
      <div style={{ background: "white", padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1464", marginBottom: 12 }}>Produtos</h1>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setSelCat(cat)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: selCat === cat ? "none" : "1px solid #d1d5db", background: selCat === cat ? "#1a1464" : "white", color: selCat === cat ? "white" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ background: "#f9fafb", padding: 10, position: "relative", textAlign: "center" }}>
              <img src={p.imageUrl} alt={p.name} style={{ height: 110, width: "100%", objectFit: "contain" }} />
              <button onClick={() => onToggleFavorite(p.id)} style={{ position: "absolute", top: 8, right: 8, background: favorites.includes(p.id) ? "#ef4444" : "white", border: "1px solid #ddd", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Heart size={14} color={favorites.includes(p.id) ? "white" : "#999"} fill={favorites.includes(p.id) ? "white" : "none"} />
              </button>
            </div>
            <div style={{ padding: "10px 10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1464", marginBottom: 2 }}>{p.brand}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333", lineHeight: 1.3, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</div>
              <StarRow count={p.stars} />
              {p.coverage && <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Rendimento: {p.coverage} m²/18L</div>}
              <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1464", margin: "6px 0 4px" }}>{fmt(p.price)}</div>
              <div style={{ fontSize: 10, color: "#059669", fontWeight: 600, marginBottom: 8 }}>6x de {fmt(p.price / 6)}</div>
              <button onClick={() => onAdd(p)} style={{ width: "100%", background: "#1a1464", color: "white", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                COMPRAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CART MODAL ───────────────────────────────────────────────────────────────

const CartModal = ({ cart, isLoggedIn, onClose, onRemove, onChangeQty, onCheckout }: {
  cart: CartItem[]
  isLoggedIn: boolean
  onClose: () => void
  onRemove: (id: number) => void
  onChangeQty: (id: number, delta: number) => void
  onCheckout: () => void
}) => {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const freeShipping = subtotal >= 400
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", width: "100%", borderRadius: "20px 20px 0 0", maxHeight: "80vh", overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1464" }}>Carrinho</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>×</button>
        </div>

        {/* Free shipping bar */}
        {cart.length > 0 && (
          <div style={{ marginBottom: 14, background: freeShipping ? "#f0fdf4" : "#f0f4ff", border: `1px solid ${freeShipping ? "#86efac" : "#bfdbfe"}`, borderRadius: 8, padding: "8px 12px" }}>
            {freeShipping ? (
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>🎉 Você ganhou frete grátis!</div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "#1a1464", fontWeight: 600, marginBottom: 4 }}>
                  Falta {fmt(400 - subtotal)} para frete grátis
                </div>
                <div style={{ height: 4, background: "#dbeafe", borderRadius: 2 }}>
                  <div style={{ height: "100%", background: "#1a1464", borderRadius: 2, width: `${Math.min(100, (subtotal / 400) * 100)}%`, transition: "width 0.3s" }} />
                </div>
              </>
            )}
          </div>
        )}

        {cart.length === 0 ? <p style={{ color: "#999", textAlign: "center", padding: 24 }}>Carrinho vazio</p> : (
          <>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: 52, height: 52, objectFit: "contain" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#1a1464", fontWeight: 700 }}>{fmt(item.price)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <button onClick={() => onChangeQty(item.id, -1)} style={{ width: 24, height: 24, border: "1px solid #d1d5db", borderRadius: 4, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.qty}</span>
                    <button onClick={() => onChangeQty(item.id, 1)} style={{ width: 24, height: 24, border: "1px solid #d1d5db", borderRadius: 4, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, padding: "12px 0", borderTop: "2px solid #e5e7eb" }}>
              <span>Total</span><span style={{ color: "#1a1464" }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "8px", textAlign: "center", fontSize: 10, color: "#1a1464", fontWeight: 600 }}>
                💳 6x de {fmt(subtotal / 6)}
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px", textAlign: "center", fontSize: 10, color: "#059669", fontWeight: 600 }}>
                {freeShipping ? "🚚 Frete grátis!" : "🚚 A partir de R$ 400"}
              </div>
            </div>
            <button onClick={onCheckout} style={{ width: "100%", background: "#1a1464", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {isLoggedIn ? "FINALIZAR COMPRA" : (<><Lock size={15} /> ENTRAR PARA FINALIZAR</>)}
            </button>
            {!isLoggedIn && (
              <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "#888" }}>
                Você precisa estar logado para concluir a compra. É rápido — leva menos de um minuto.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  const bg = type === "success" ? "#059669" : type === "error" ? "#dc2626" : "#1a1464"
  return (
    <div style={{ position: "fixed", top: 70, right: 12, background: bg, color: "white", padding: "10px 16px", borderRadius: 10, zIndex: 400, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8, maxWidth: 280 }}>
      <Check size={16} />{message}
    </div>
  )
}

// ─── WHATSAPP FAB ─────────────────────────────────────────────────────────────

const WhatsAppFAB = () => (
  <a href="https://wa.me/551932660789?text=Olá! Gostaria de mais informações."
    target="_blank" rel="noreferrer"
    style={{ position: "fixed", bottom: 20, right: 16, width: 52, height: 52, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,211,102,0.5)", zIndex: 200, textDecoration: "none" }}>
    <MessageCircle size={26} color="white" fill="white" />
  </a>
)

// ─── APP ROOT ────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home")
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [toast, setToast] = useState<ToastData | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [authOpen, setAuthOpen] = useState(false)

  const showToast = useCallback((message: string, type: ToastData["type"] = "success") => setToast({ message, type }), [])

  // Ao entrar no site, já recupera a sessão salva (se a pessoa já tinha feito login antes)
  useEffect(() => {
    setUser(getSession())
  }, [])

  const handleAuthSuccess = useCallback((u: SessionUser) => {
    setUser(u)
    setAuthOpen(false)
    showToast(`Bem-vindo(a), ${u.name.split(" ")[0]}!`)
  }, [showToast])

  const handleLogout = useCallback(() => {
    clearSession()
    setUser(null)
    showToast("Você saiu da sua conta", "info")
  }, [showToast])

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]
    })
    showToast(`${p.name} adicionado!`)
  }, [showToast])

  const addKitToCart = useCallback((name: string, price: number) => {
    const kitProduct: Product = { id: Date.now(), name, price, imageUrl: "", category: "Kits", brand: "Silver", stars: 5 }
    setCart(prev => [...prev, { ...kitProduct, qty: 1 }])
    showToast(`Kit adicionado ao carrinho! 🎉`)
  }, [showToast])

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id))
    showToast("Removido do carrinho", "error")
  }, [showToast])

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }, [])

  // Só deixa finalizar a compra se a pessoa já tiver conta/estiver logada.
  // Sem sessão: fecha o carrinho, abre o login/cadastro e avisa por toast.
  const handleCheckout = useCallback(() => {
    if (!user) {
      setCartOpen(false)
      setAuthOpen(true)
      showToast("Crie uma conta ou faça login para finalizar a compra", "info")
      return
    }
    setCartOpen(false)
    if (typeof window !== "undefined" && cart.length > 0) {
      localStorage.setItem("silver-cart", JSON.stringify(cart))
      window.location.href = "/checkout"
    }
  }, [user, cart, showToast])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const goToCategory = (_cat: string) => setPage("produtos")

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "system-ui, -apple-system, sans-serif", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} onGoHome={() => setPage("home")} onGoCor={() => setPage("cor")} currentPage={page} setPage={setPage}
        user={user} onOpenAuth={() => setAuthOpen(true)} onLogout={handleLogout} />

      {page === "home" && (
        <>
          <HeroCarousel />
          <CategoriesGrid onCategoryClick={goToCategory} />
          <FeaturedProducts onAdd={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} />
          <CategorySection onCategoryClick={goToCategory} />
          <StoreBanner />
          <ColorBanner setPage={setPage} />
          <BrandsSection />
          <Footer />
        </>
      )}

      {page === "produtos" && (
        <>
          <ProductsPage onAdd={addToCart} favorites={favorites} onToggleFavorite={toggleFavorite} />
          <Footer />
        </>
      )}

      {page === "cor" && (<><ColorPage /><Footer /></>)}
      {page === "kits" && (<><KitsPage onAddKit={addKitToCart} /><Footer /></>)}
      {page === "calculadora" && (<><CalculatorPage /><Footer /></>)}
      {page === "simulador" && (<><SimulatorPage /><Footer /></>)}
      {page === "entrega" && (<><DeliveryPage /><Footer /></>)}

      <WhatsAppFAB />

      {cartOpen && (
        <CartModal cart={cart} isLoggedIn={!!user} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onChangeQty={changeQty}
          onCheckout={handleCheckout} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Login isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} initialMode="login" />
    </div>
  )
}