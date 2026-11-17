import { existsSync } from "node:fs"
import { resolve } from "node:path"
import nextEnv from "@next/env"

nextEnv.loadEnvConfig(process.cwd())

const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "ASAAS_API_KEY",
  "ASAAS_WEBHOOK_TOKEN",
]

let missingVariables = false

for (const name of requiredVariables) {
  const configured = Boolean(process.env[name]?.trim())
  console.log(`${configured ? "OK" : "FALTA"} ${name}`)
  if (!configured) missingVariables = true
}

const adminKeyConfigured = Boolean(
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
)
console.log(`${adminKeyConfigured ? "OK" : "FALTA"} SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY`)
if (!adminKeyConfigured) missingVariables = true

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
if (!appUrl) {
  console.log("FALTA NEXT_PUBLIC_APP_URL")
  missingVariables = true
} else {
  try {
    const url = new URL(appUrl)
    const local = ["localhost", "127.0.0.1"].includes(url.hostname)
    if (!(url.protocol === "https:" && !local) && !(url.protocol === "http:" && local)) {
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

for (const file of ["supabase_setup.sql", "supabase_asaas_migration.sql"]) {
  if (!existsSync(resolve(process.cwd(), file))) {
    console.error(`FALTA ${file}`)
    missingVariables = true
  } else {
    console.log(`OK ${file} encontrado.`)
  }
}

if (missingVariables) {
  console.error("\\nConfiguração incompleta. Preencha .env.local e execute npm run setup:check novamente.")
  process.exitCode = 1
} else {
  console.log("\\nVariáveis encontradas. Execute as migrações SQL e valide as credenciais no Sandbox.")
}
