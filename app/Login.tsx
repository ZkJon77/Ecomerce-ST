"use client"

import React, { useState } from "react"
import { X, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react"
import Cadastro, { getUsers, setSession, SessionUser } from "./Cadastro"

// ─── LOGIN (interligado com Cadastro.tsx) ─────────────────────────────────────
// Este componente é o modal de autenticação inteiro: por padrão mostra o
// formulário de login (pensando que a pessoa já tem cadastro) e alterna
// para o formulário de Cadastro.tsx quando ela pedir "Criar conta".

interface LoginProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: SessionUser) => void
  initialMode?: "login" | "cadastro"
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default function Login({ isOpen, onClose, onSuccess, initialMode = "login" }: LoginProps) {
  const [mode, setMode] = useState<"login" | "cadastro">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Alterna para o cadastro, reaproveitando o mesmo overlay/onSuccess/onClose.
  if (mode === "cadastro") {
    return (
      <Cadastro
        onSuccess={onSuccess}
        onSwitchToLogin={() => setMode("login")}
        onClose={onClose}
      />
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.")
      return
    }
    if (!isValidEmail(email)) {
      setError("Digite um e-mail válido.")
      return
    }

    setLoading(true)
    const users = getUsers()
    const found = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )

    setTimeout(() => {
      setLoading(false)
      if (!found) {
        setError("E-mail ou senha incorretos.")
        return
      }
      const session: SessionUser = { name: found.name, email: found.email, phone: found.phone }
      setSession(session)
      onSuccess(session)
    }, 400)
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "white", width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflowY: "auto", padding: "22px 20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#1a1464" }}>Entrar</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Acesse sua conta Silver Tintas</div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#666" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>E-mail</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Mail size={15} color="#999" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoFocus
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Senha</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Lock size={15} color="#999" />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showPass ? <EyeOff size={15} color="#999" /> : <Eye size={15} color="#999" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#4c4a8a" : "#1a1464", color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 800, cursor: loading ? "default" : "pointer", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? "Entrando..." : (<><LogIn size={16} /> Entrar</>)}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#666" }}>
          Ainda não tem conta?{" "}
          <button onClick={() => { setError(""); setMode("cadastro") }} style={{ background: "none", border: "none", color: "#1a1464", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}>
            Cadastre-se
          </button>
        </div>
      </div>
    </div>
  )
}
