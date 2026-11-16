import { existsSync } from "node:fs"
import { resolve } from "node:path"
import nextEnv from "@next/env"

nextEnv.loadEnvConfig(process.cwd())

const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MP_ACCESS_TOKEN",
]

let missingVariables = false

for (const name of requiredVariables) {
  const configured = Boolean(process.env[name]?.trim())
  console.log(`${configured ? "OK" : "FALTA"} ${name}`)
  if (!configured) missingVariables = true
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
if (!appUrl) {
  console.log("FALTA NEXT_PUBLIC_APP_URL")
  missingVariables = true
} else {
  try {
    const url = new URL(appUrl)
    const localDevelopment = ["localhost", "127.0.0.1"].includes(url.hostname)
    const secureProductionUrl = url.protocol === "https:" && !localDevelopment
    const validLocalUrl = url.protocol === "http:" && localDevelopment
    if (!secureProductionUrl && !validLocalUrl) {
      console.log("FALTA NEXT_PUBLIC_APP_URL precisa ser HTTPS em produção ou localhost no desenvolvimento.")
      missingVariables = true
    } else {
      console.log("OK NEXT_PUBLIC_APP_URL")
    }
  } catch {
    console.log("FALTA NEXT_PUBLIC_APP_URL não é uma URL válida.")
    missingVariables = true
  }
}

const setupSql = resolve(process.cwd(), "supabase_setup.sql")
if (!existsSync(setupSql)) {
  console.error("FALTA supabase_setup.sql não foi encontrado.")
  missingVariables = true
} else {
  console.log("OK supabase_setup.sql encontrado (execute-o manualmente no SQL Editor do Supabase).")
}

if (missingVariables) {
  console.error("\nConfiguração incompleta. Preencha as variáveis em .env.local e execute npm run setup:check novamente.")
  process.exitCode = 1
} else {
  console.log("\nVariáveis configuradas. Confirme no Supabase que supabase_setup.sql já foi executado.")
}
