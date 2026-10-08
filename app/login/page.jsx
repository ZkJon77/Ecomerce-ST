"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, LogIn, UserPlus, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isRegistering && password !== confirmPassword) {
      alert("As senhas não conferem!")
      return
    }

    setIsLoading(true)
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error;

        if (data.user && data.session) {
          alert("Conta criada com sucesso!")
          router.push("/")
        } else {
          alert("Conta criada com sucesso! Verifique seu email para confirmar o acesso.")
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error;
        alert("Login realizado com sucesso!")
        router.push("/")
      }
    } catch (error) {
      let friendlyMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        friendlyMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("User already registered")) {
        friendlyMessage = "Este email já está cadastrado.";
      } else if (error.message.includes("Password should be at least 6 characters")) {
        friendlyMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      alert("Erro: " + friendlyMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      alert("Erro na autenticação com Google: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1a1464", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <header style={{ background: "#1a1464", padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container mx-auto flex items-center relative">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Voltar para a loja</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 900, fontSize: 22, color: "white" }}>
              Silver
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase" }}>
              tintas
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-0 shadow-xl" style={{ background: "white", borderRadius: 20 }}>
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "#1a1464" }}>
              <LogIn className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold" style={{ color: "#1a1464" }}>
              {isRegistering ? "Criar Conta" : "Entrar"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRegistering
                ? "Crie sua conta para salvar favoritos"
                : "Acesse sua conta para compras rápidas"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {isRegistering && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 font-bold text-sm"
                style={{ background: "#1a1464" }}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRegistering ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>


              <div className="text-center text-sm mt-2">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-primary font-semibold hover:underline"
                >
                  {isRegistering ? "Faça login aqui" : "Cadastre-se agora"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="text-center py-4 text-white/40 text-xs">
        © 2026 Silver Tintas — Campinas, SP
      </footer>
    </div>
  )
}
