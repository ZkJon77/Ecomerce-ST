"use client"
import React from "react"
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { CartItem } from "@/lib/constants"

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: number) => void;
  onChangeQty: (id: number, delta: number) => void;
  onCheckout: () => void;
}

export default function CartModal({ cart, onClose, onRemove, onChangeQty, onCheckout }: CartModalProps) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ position: "relative", width: 400, background: "white", height: "100%", boxShadow: "-4px 0 15px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease-out" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1464", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={20} />
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Carrinho</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 5 }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
              <ShoppingBag size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p>Seu carrinho está vazio</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px", border: "1px solid #eee", borderRadius: 8, alignItems: "center" }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: "contain", background: "#f9fafb", borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{fmt(item.price)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => onChangeQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #ddd", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.qty}</span>
                      <button onClick={() => onChangeQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #ddd", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 5 }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 16, color: "#666" }}>Total:</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#1a1464" }}>{fmt(total)}</span>
            </div>
            <button onClick={onCheckout} style={{ width: "100%", background: "#1a1464", color: "white", border: "none", borderRadius: 8, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
              FINALIZAR COMPRA
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
