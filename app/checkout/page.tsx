"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  CreditCard,
  QrCode,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Package,
  User
} from "lucide-react"

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Product {
  id: number | string
  name: string
  price: number
  imageUrl: string
}

interface CartItem extends Product {
  qty: number
}

interface PaymentResponse {
  id: string
  status: string
  amount: number
  paymentMethod: string
  qrCode?: string
  copyPaste?: string
  boletoUrl?: string
}

const fmt = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");

// ─── CHECKOUT PAGE ───────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [userData, setUserData] = useState({ name: "", email: "", phone: "", address: "" })
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto' | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("silver-cart")
    if (stored) {
      setCart(JSON.parse(stored))
    } else {
      router.push("/") // Redirect home if cart is empty
    }
  }, [router])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  /**
   * Handles the payment request to the backend.
   * Communicates with /api/checkout/create-payment to simulate the transaction.
   */
  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Por favor, escolha um método de pagamento.")
      return
    }
    if (!userData.name || !userData.email) {
      alert("Por favor, preencha seus dados básicos.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          userData,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setPaymentResult(data.payment);
      } else {
        alert("Erro ao processar pagamento: " + (data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Erro de conexão com o servidor de pagamento.");
    } finally {
      setLoading(false);
    }
  }

  // If payment is successful/pending, show the result view
  if (paymentResult) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
          <div style={{ background: "white", borderRadius: 16, padding: "32px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={32} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1464", marginBottom: 8 }}>Pagamento Processado!</h1>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Seu pedido foi registrado com sucesso. Confira os detalhes abaixo:</p>

            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "20px", textAlign: "left", border: "1px solid #e5e7eb", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "#888" }}>ID do Pedido:</span>
                <span style={{ fontWeight: 600 }}>{paymentResult.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "#888" }}>Valor Total:</span>
                <span style={{ fontWeight: 700, color: "#1a1464" }}>{fmt(paymentResult.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#888" }}>Método:</span>
                <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{paymentResult.paymentMethod}</span>
              </div>
            </div>

            {paymentResult.paymentMethod === 'pix' && (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464", marginBottom: 12 }}>Escaneie o QR Code para pagar:</div>
                <img src={paymentResult.qrCode} alt="Pix QR Code" style={{ width: 200, height: 200, margin: "0 auto 16px", background: "white", padding: 8, border: "1px solid #ddd" }} />
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Ou copie a chave Pix:</div>
                <div style={{ background: "#f3f4f6", padding: "10px", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#444", border: "1px dashed #ccc", overflowX: "auto", whiteSpace: "nowrap" }}>
                  {paymentResult.copyPaste}
                </div>
              </div>
            )}

            {paymentResult.paymentMethod === 'boleto' && (
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1464", marginBottom: 12 }}>Seu boleto está pronto:</div>
                <a href={paymentResult.boletoUrl} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1a1464", color: "white", textDecoration: "none", padding: "14px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                  <FileText size={18} /> Baixar PDF do Boleto
                </a>
              </div>
            )}

            {paymentResult.paymentMethod === 'card' && (
              <div style={{ textAlign: "center", marginBottom: 24, padding: "20px", background: "#f0fdf4", borderRadius: 12, border: "1px solid #86efac" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>Pagamento Aprovado!</div>
                <div style={{ fontSize: 13, color: "#166534" }}>Obrigado por sua compra. Você receberá a confirmação por email.</div>
              </div>
            )}

            <button onClick={() => router.push("/")} style={{ width: "100%", background: "none", border: "1px solid #d1d5db", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#666" }}>
              Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#1a1464", padding: "16px", color: "white" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <ChevronLeft size={20} /> Voltar
          </button>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Finalizar Compra</div>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        {/* Left Column: User Data & Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <User size={20} color="#1a1464" />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1464", margin: 0 }}>Informações de Entrega</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Nome Completo</label>
                <input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} placeholder="Ex: João Silva"
                  style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Email</label>
                <input value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} placeholder="email@exemplo.com"
                  style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Telefone</label>
                <input value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} placeholder="(19) 99999-9999"
                  maxLength={15}
                  style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>CEP</label>
                <input value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} placeholder="00000-000"
                  maxLength={9}
                  style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
              </div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <CreditCard size={20} color="#1a1464" />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1464", margin: 0 }}>Forma de Pagamento</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { id: 'card', label: 'Cartão', icon: <CreditCard size={20} /> },
                { id: 'pix', label: 'Pix', icon: <QrCode size={20} /> },
                { id: 'boleto', label: 'Boleto', icon: <FileText size={20} /> },
              ].map(method => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id as any)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "16px 12px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                    border: paymentMethod === method.id ? "2px solid #1a1464" : "1px solid #e5e7eb",
                    background: paymentMethod === method.id ? "#f0f4ff" : "white",
                    color: paymentMethod === method.id ? "#1a1464" : "#666",
                    fontWeight: paymentMethod === method.id ? 700 : 500,
                  }}>
                  {method.icon}
                  <span style={{ fontSize: 13 }}>{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", height: "fit-content" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Package size={20} color="#1a1464" />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1464", margin: 0 }}>Resumo do Pedido</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: 32, height: 32, objectFit: "contain" }} />
                  <span style={{ color: "#333", fontWeight: 500 }}>{item.name} (x{item.qty})</span>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: 800, color: "#1a1464" }}>
              <span>Total</span>
              <span>{fmt(subtotal)}</span>
            </div>
          </div>
          <button onClick={handlePayment} disabled={loading}
            style={{
              width: "100%", background: loading ? "#9ca3af" : "linear-gradient(135deg, #1a1464 0%, #2d3a8c 100%)",
              color: "white", border: "none", borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 0.2s"
            }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            {loading ? "Processando..." : "FINALIZAR PAGAMENTO"}
          </button>
        </div>
      </div>
    </div>
  )
}
