"use client"

import React, { useState } from "react"
import { X, User, Mail, Lock, Phone, Eye, EyeOff, Check } from "lucide-react"

// ─── AUTH STORAGE (compartilhado com Login.tsx) ───────────────────────────────
// Simulação simples de "backend" usando localStorage. Quando o backend
// real existir, troque só o corpo destas funções por chamadas de API —
// as assinaturas já foram pensadas para isso.

export interface StoredUser {
  name: string
  email: string
  password: string
  phone: string
}

export type SessionUser = Omit<StoredUser, "password">

const USERS_KEY = "silver-users"
const SESSION_KEY = "silver-session"

export const getUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveUsers = (users: StoredUser[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const setSession = (user: SessionUser) => {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export const getSession = (): SessionUser | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearSession = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}

// ─── VALIDAÇÃO ────────────────────────────────────────────────────────────────

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const formatPhone = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ─── CADASTRO ─────────────────────────────────────────────────────────────────

interface CadastroProps {
  onSuccess: (user: SessionUser) => void
  onSwitchToLogin: () => void
  onClose: () => void
}

export default function Cadastro({ onSuccess, onSwitchToLogin, onClose }: CadastroProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    if (!isValidEmail(email)) {
      setError("Digite um e-mail válido.")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    const users = getUsers()
    const alreadyExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())
    if (alreadyExists) {
      setLoading(false)
      setError("Já existe uma conta cadastrada com este e-mail.")
      return
    }

    const newUser: StoredUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
    }
    saveUsers([...users, newUser])

    const session: SessionUser = { name: newUser.name, email: newUser.email, phone: newUser.phone }
    setSession(session)

    setTimeout(() => {
      setLoading(false)
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
            <div style={{ fontSize: 19, fontWeight: 800, color: "#1a1464" }}>Criar conta</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Leva menos de um minuto</div>
          </div>
          <button onClick={onClose} aria-label="Fechar"
            style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#666" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Nome completo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <User size={15} color="#999" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>E-mail</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Mail size={15} color="#999" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Telefone <span style={{ color: "#bbb", fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Phone size={15} color="#999" />
              <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(19) 99999-9999"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Senha</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Lock size={15} color="#999" />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                {showPass ? <EyeOff size={15} color="#999" /> : <Eye size={15} color="#999" />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>Confirmar senha</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}>
              <Lock size={15} color="#999" />
              <input type={showPass ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha"
                style={{ border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent" }} />
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#4c4a8a" : "#1a1464", color: "white", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 800, cursor: loading ? "default" : "pointer", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? "Criando conta..." : (<><Check size={16} /> Criar conta</>)}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#666" }}>
          Já tem uma conta?{" "}
          <button onClick={onSwitchToLogin} style={{ background: "none", border: "none", color: "#1a1464", fontWeight: 700, cursor: "pointer", fontSize: 12, padding: 0 }}>
            Entrar
          </button>
        </div>
      </div>
    </div>
  )
}
