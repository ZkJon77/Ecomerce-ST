// lib/auth.ts
// Simulação de "backend" usando localStorage. Quando o backend real existir,
// troque só o corpo destas funções por chamadas de API — as assinaturas já
// foram pensadas para isso.

export interface StoredUser {
  name: string
  email: string
  password?: string // ausente para contas criadas via Google
  phone?: string
  avatar?: string
  provider: "local" | "google"
  googleId?: string
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

// ─── Validação ──────────────────────────────────────────────────────────────

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const formatPhone = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ─── Google Sign-In ─────────────────────────────────────────────────────────
// O botão do Google (components/GoogleSignInButton.tsx) devolve um
// "credential": um ID token JWT assinado pelo Google. Aqui a gente só
// decodifica o payload no navegador pra tirar nome/e-mail/foto.
//
// ⚠️ IMPORTANTE: decodificar no client só serve pra este modo "sem backend".
// Assim que existir uma API própria, o certo é mandar esse `credential` pro
// servidor e validar a assinatura com a lib oficial (google-auth-library ou
// verificação via https://oauth2.googleapis.com/tokeninfo) antes de confiar
// nos dados — nunca confie em um JWT decodificado apenas no front em produção.

interface GoogleJwtPayload {
  sub: string
  email: string
  name: string
  picture?: string
  email_verified?: boolean
}

export const decodeGoogleCredential = (credential: string): GoogleJwtPayload => {
  const payload = credential.split(".")[1]
  const json = decodeURIComponent(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  )
  return JSON.parse(json)
}

// Cria a conta na primeira vez (ou reaproveita uma já existente pelo e-mail)
// e já deixa a sessão logada.
export const loginWithGoogleCredential = (credential: string): SessionUser => {
  const data = decodeGoogleCredential(credential)
  const users = getUsers()
  const emailLower = data.email.toLowerCase()
  const existing = users.find(u => u.email.toLowerCase() === emailLower)

  const user: StoredUser = existing
    ? { ...existing, name: data.name, avatar: data.picture ?? existing.avatar, googleId: data.sub }
    : {
        name: data.name,
        email: emailLower,
        avatar: data.picture,
        googleId: data.sub,
        provider: "google",
      }

  const nextUsers = existing
    ? users.map(u => (u.email.toLowerCase() === emailLower ? user : u))
    : [...users, user]

  saveUsers(nextUsers)

  const { password, ...session } = user
  setSession(session)
  return session
}