"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

// Requer NEXT_PUBLIC_GOOGLE_CLIENT_ID no .env.local — veja instruções no
// final da resposta sobre como gerar esse Client ID no Google Cloud Console.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void
  onError?: (message: string) => void
}

export default function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)

  const initGoogle = () => {
    if (!window.google || !buttonRef.current) return

    if (!CLIENT_ID) {
      onError?.("NEXT_PUBLIC_GOOGLE_CLIENT_ID não configurado no .env.local")
      return
    }

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: { credential: string }) => onCredential(response.credential),
      auto_select: false,
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "pill",
      locale: "pt-BR",
    })
  }

  useEffect(() => {
    // Cobre o caso do script já estar em cache/carregado quando o
    // componente monta de novo (ex: troca entre login/cadastro).
    if (window.google) initGoogle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <div ref={buttonRef} style={{ display: "flex", justifyContent: "center", minHeight: 44 }} />
    </>
  )
}