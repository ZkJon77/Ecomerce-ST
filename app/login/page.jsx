"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react"
import { supabase, hasSupabasePublicConfig } from "@/lib/supabase"

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d8dce7",
  borderRadius: 10,
  background: "#fff",
  color: "#202638",
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
}

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState(null)

  const switchMode = () => {
    setIsRegistering((current) => !current)
    setMessage(null)
    setPassword("")
    setConfirmPassword("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (isRegistering && password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem. Confira e tente novamente." })
      return
    }

    if (!hasSupabasePublicConfig) {
      setMessage({
        type: "error",
        text: "O acesso ainda não está configurado. Adicione a URL e a chave pública do Supabase ao arquivo .env.local e reinicie o servidor.",
      })
      return
    }

    setIsLoading(true)
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })
        if (error) throw error

        if (data.session) {
          router.push("/")
          return
        }

        setPassword("")
        setConfirmPassword("")
        setMessage({
          type: "success",
          text: "Cadastro iniciado. Verifique seu e-mail para confirmar a conta antes de entrar.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
        if (error) throw error
        router.push("/")
      }
    } catch (error) {
      const errorMessage = error?.message || ""
      let text = "Não foi possível concluir a solicitação. Tente novamente."
      if (/invalid login credentials/i.test(errorMessage)) {
        text = "E-mail ou senha incorretos. Confira os dados e tente novamente."
      } else if (/user already registered/i.test(errorMessage)) {
        text = "Este e-mail já possui cadastro. Entre na sua conta."
      } else if (/password should be at least/i.test(errorMessage)) {
        text = "A senha deve ter pelo menos 6 caracteres."
      } else if (/email not confirmed/i.test(errorMessage)) {
        text = "Confirme seu e-mail pelo link enviado antes de entrar."
      } else if (/fetch failed|network|failed to fetch/i.test(errorMessage)) {
        text = "Não foi possível conectar ao serviço de autenticação. Verifique a conexão e a configuração do Supabase."
      } else if (errorMessage) {
        text = errorMessage
      }
      setMessage({ type: "error", text })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setMessage(null)
    if (!hasSupabasePublicConfig) {
      setMessage({
        type: "error",
        text: "A recuperação de senha ficará disponível depois de configurar o Supabase.",
      })
      return
    }
    if (!email.trim()) {
      setMessage({ type: "error", text: "Informe seu e-mail para receber o link de recuperação." })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setMessage({
        type: "success",
        text: "Se houver uma conta com este e-mail, enviaremos as instruções de recuperação.",
      })
    } catch (error) {
      setMessage({ type: "error", text: error?.message || "Não foi possível solicitar a recuperação agora." })
    } finally {
      setIsLoading(false)
    }
  }

  const labelStyle = { display: "block", marginBottom: 7, color: "#30384b", fontSize: 13, fontWeight: 650 }
  const iconStyle = { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#7b8498" }
  const iconInputStyle = { ...fieldStyle, paddingLeft: 42, paddingRight: 44 }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(145deg, #f3f5fb 0%, #e9edf7 100%)",
      color: "#202638",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      <header style={{
        height: 68,
        padding: "0 clamp(16px, 5vw, 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#17134f",
        color: "#fff",
        boxShadow: "0 4px 18px rgba(20, 24, 67, 0.18)",
      }}>
        <button type="button" onClick={() => router.push("/")} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: 0,
          padding: "9px 0",
          color: "rgba(255,255,255,.82)",
          background: "transparent",
          fontSize: 14,
          cursor: "pointer",
        }}>
          <ArrowLeft size={18} />
          <span>Voltar para a loja</span>
        </button>
        <button type="button" onClick={() => router.push("/")} aria-label="Silver Tintas, página inicial" style={{
          border: 0,
          padding: 0,
          color: "white",
          background: "transparent",
          textAlign: "right",
          cursor: "pointer",
        }}>
          <span style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic", fontWeight: 700, lineHeight: 1 }}>Silver</span>
          <span style={{ display: "block", marginTop: 3, color: "rgba(255,255,255,.6)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Tintas</span>
        </button>
      </header>

      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 18px",
      }}>
        <section style={{
          width: "100%",
          maxWidth: 440,
          boxSizing: "border-box",
          padding: "clamp(24px, 6vw, 40px)",
          border: "1px solid rgba(220,224,235,.9)",
          borderRadius: 18,
          background: "#fff",
          boxShadow: "0 18px 55px rgba(25, 32, 73, .12)",
        }}>
          <div style={{
            width: 48,
            height: 48,
            margin: "0 auto 18px",
            display: "grid",
            placeItems: "center",
            borderRadius: 14,
            color: "#fff",
            background: "#1a1464",
          }}>
            {isRegistering ? <UserRound size={23} /> : <KeyRound size={22} />}
          </div>
          <h1 style={{ margin: 0, color: "#1a1464", textAlign: "center", fontSize: 26, letterSpacing: "-.4px" }}>
            {isRegistering ? "Crie sua conta" : "Acesse sua conta"}
          </h1>
          <p style={{ margin: "9px 0 26px", color: "#70798c", textAlign: "center", fontSize: 14, lineHeight: 1.55 }}>
            {isRegistering
              ? "Cadastre-se para acompanhar seus pedidos e facilitar suas compras."
              : "Entre para acompanhar seus pedidos e comprar com mais praticidade."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 17 }}>
            {isRegistering && (
              <div>
                <label htmlFor="full-name" style={labelStyle}>Nome completo</label>
                <div style={{ position: "relative" }}>
                  <UserRound size={18} style={iconStyle} />
                  <input
                    id="full-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Como podemos chamar você?"
                    style={iconInputStyle}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" style={labelStyle}>E-mail</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={iconStyle} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@email.com"
                  style={iconInputStyle}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <LockKeyhole size={18} style={iconStyle} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegistering ? "Mínimo de 6 caracteres" : "Digite sua senha"}
                  style={iconInputStyle}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} style={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  display: "grid",
                  placeItems: "center",
                  border: 0,
                  padding: 4,
                  color: "#70798c",
                  background: "transparent",
                  cursor: "pointer",
                }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="confirm-password" style={labelStyle}>Confirme a senha</label>
                <div style={{ position: "relative" }}>
                  <LockKeyhole size={18} style={iconStyle} />
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Digite novamente sua senha"
                    style={iconInputStyle}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"} style={{
                    position: "absolute",
                    top: "50%",
                    right: 12,
                    transform: "translateY(-50%)",
                    display: "grid",
                    placeItems: "center",
                    border: 0,
                    padding: 4,
                    color: "#70798c",
                    background: "transparent",
                    cursor: "pointer",
                  }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {!isRegistering && (
              <div style={{ marginTop: -7, textAlign: "right" }}>
                <button type="button" onClick={handlePasswordReset} disabled={isLoading} style={{
                  border: 0,
                  padding: 0,
                  color: "#343d86",
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading ? "default" : "pointer",
                }}>
                  Esqueci minha senha
                </button>
              </div>
            )}

            {message && (
              <div role={message.type === "error" ? "alert" : "status"} aria-live="polite" style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                padding: "12px 13px",
                border: `1px solid ${message.type === "error" ? "#f1c7c7" : "#b9e3ce"}`,
                borderRadius: 10,
                color: message.type === "error" ? "#8f2f34" : "#176c45",
                background: message.type === "error" ? "#fff6f5" : "#f1fbf5",
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {message.type === "success" && <CheckCircle2 size={17} style={{ flex: "0 0 auto", marginTop: 1 }} />}
                <span>{message.text}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading} style={{
              minHeight: 48,
              marginTop: 2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              border: 0,
              borderRadius: 10,
              color: "#fff",
              background: isLoading ? "#7774a7" : "#1a1464",
              boxShadow: "0 6px 14px rgba(26,20,100,.18)",
              fontSize: 15,
              fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
            }}>
              {isLoading && <LoaderCircle size={18} className="animate-spin" />}
              {isLoading ? "Aguarde..." : isRegistering ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <div style={{ height: 1, margin: "24px 0 18px", background: "#edf0f5" }} />
          <p style={{ margin: 0, color: "#70798c", textAlign: "center", fontSize: 14 }}>
            {isRegistering ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <button type="button" onClick={switchMode} style={{
              border: 0,
              padding: 0,
              color: "#28216e",
              background: "transparent",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}>
              {isRegistering ? "Entrar" : "Cadastre-se"}
            </button>
          </p>
        </section>
      </main>

      <footer style={{ padding: "16px", color: "#81889a", textAlign: "center", fontSize: 12 }}>
        © 2026 Silver Tintas · Campinas, SP
      </footer>
    </div>
  )
}
