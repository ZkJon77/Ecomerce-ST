"use client"
import React, { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/Header"
import HeroCarousel from "@/components/HeroCarousel"
import QuickFeatures from "@/components/QuickFeatures"
import CategoriesGrid from "@/components/CategoriesGrid"
import FeaturedProducts from "@/components/FeaturedProducts"
import TipsSection from "@/components/TipsSection"
import CategorySection from "@/components/CategorySection"
import StoreBanner from "@/components/StoreBanner"
import ColorBanner from "@/components/ColorBanner"
import BrandsSection from "@/components/BrandsSection"
import Footer from "@/components/Footer"
import ProductsPage from "@/components/ProductsPage"
import KitsPage from "@/components/KitsPage"
import CalculatorPage from "@/components/CalculatorPage"
import SimulatorPage from "@/components/SimulatorPage"
import ProductDetailsPage from "@/components/ProductDetailsPage"

import DeliveryPage from "@/components/DeliveryPage"
import ColorPage from "@/components/ColorPage"
import CartModal from "@/components/CartModal"
import Toast from "@/components/Toast"
import WhatsAppFAB from "@/components/WhatsAppFAB"
import { Product, CartItem, ToastData } from "@/lib/constants"
import { supabase } from "@/lib/supabase"

export default function App() {
  const [page, setPage] = useState("home")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [toast, setToast] = useState<ToastData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [kits, setKits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Import constants first as a guaranteed baseline
        const { PRODUCTS, KITS } = await import('@/lib/constants');

        try {
          // Try to get user session (ignore failure if not logged in)
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
        } catch (e) {
          console.log("No active session");
        }

        const [prodRes, kitRes] = await Promise.all([
          fetch('/api/products').catch(() => ({ ok: false })),
          fetch('/api/kits').catch(() => ({ ok: false }))
        ]);

        // Force usage of constants for now to ensure new products appear
        const prodData = PRODUCTS;
        const kitData = KITS;

        setProducts(prodData);
        setKits(kitData);
      } catch (error) {
        console.error("Failed to load data:", error);
        // Last resort: use constants
        const { PRODUCTS, KITS } = await import('@/lib/constants');
        setProducts(PRODUCTS);
        setKits(KITS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = useCallback((message: string, type: ToastData["type"] = "success") => setToast({ message, type }), [])

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]
    })
    showToast(p.name + " adicionado!")
  }, [showToast])

  const addKitToCart = useCallback((kit: any) => {
    const kitProduct: Product = {
      id: kit.id,
      name: kit.name,
      price: kit.price,
      imageUrl: kit.imageUrl,
      category: "Kits",
      brand: "Silver",
      stars: 5
    }
    setCart(prev => [...prev, { ...kitProduct, qty: 1 }])
    showToast("Kit adicionado ao carrinho! 🎉")
  }, [showToast])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
    showToast("Removido do carrinho", "error")
  }, [showToast])

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }, [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const goToCategory = (cat: string) => {
    setPage("produtos")
    // We'll pass the category to the products page via a state or query,
    // but for now we'll let ProductsPage handle the initial category.
  }


  const handleProductClick = useCallback((id: string) => {
    setSelectedProductId(id);
    setPage("details");
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Carregando Silver Tintas...
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "system-ui, -apple-system, sans-serif", width: "100%" }}>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} onGoHome={() => setPage("home")} onGoCor={() => setPage("cor")} currentPage={page} setPage={setPage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {page === "home" && (
        <>
          <HeroCarousel />
          <QuickFeatures setPage={setPage} />
          <CategoriesGrid onCategoryClick={goToCategory} />
          <FeaturedProducts
            products={products.slice(0, 8)}
            onAdd={addToCart}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onProductClick={handleProductClick}
          />
          <TipsSection />
          <CategorySection onCategoryClick={goToCategory} />
          <StoreBanner />
          <ColorBanner setPage={setPage} />
          <BrandsSection />
          <Footer />
        </>
      )}

      {page === "produtos" && (
        <>
          <ProductsPage
            products={products}
            onAdd={addToCart}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            searchQuery={searchQuery}
            setPage={setPage}
            onProductClick={handleProductClick}
          />
          <Footer />
        </>
      )}

      {page === "cor" && (<><ColorPage /><Footer /></>)}
      {page === "kits" && (<><KitsPage kits={kits} onAddKit={addKitToCart} /><Footer /></>)}
      {page === "calculadora" && (<><CalculatorPage /><Footer /></>)}
      {page === "simulador" && (<><SimulatorPage /><Footer /></>)}
      {page === "entrega" && (<><DeliveryPage /><Footer /></>)}
      {page === "details" && (
        <>
          <ProductDetailsPage
            productId={selectedProductId || ""}
            onAdd={addToCart}
            setPage={setPage}
            products={products}
          />
          <Footer />
        </>
      )}

      <WhatsAppFAB />

      {cartOpen && (
        <CartModal cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onChangeQty={changeQty}
          onCheckout={() => {
            setCartOpen(false)
            if (typeof window !== "undefined" && cart.length > 0) {
              localStorage.setItem("silver-cart", JSON.stringify(cart))
              window.location.href = "/checkout"
            }
          }} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
