import 'server-only';

import { createClient } from '@supabase/supabase-js';

function getValidSupabaseUrl() {
  // NEXT_PUBLIC_SUPABASE_URL é a URL do projeto usada pelo frontend.
  // Priorize-a para evitar que uma SUPABASE_URL antiga na Vercel conecte
  // o backend a outro projeto por engano.
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  ];

  const valid = [];
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    try {
      const url = new URL(candidate.trim());
      if ((url.protocol === 'https:' || url.protocol === 'http:') && url.hostname) {
        valid.push(url.origin);
      }
    } catch {
      // Ignora valores inválidos e tenta a próxima variável.
    }
  }

  if (new Set(valid).size > 1) {
    console.error('[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL e SUPABASE_URL apontam para projetos diferentes. Usando NEXT_PUBLIC_SUPABASE_URL; alinhe as duas variáveis na Vercel.');
  }

  return valid[0] || '';
}

const supabaseUrl = getValidSupabaseUrl();
// A chave secreta atual é preferida; service_role é compatibilidade legada.
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const hasSupabaseAdminConfig = Boolean(supabaseUrl && supabaseSecretKey);

// Registra falhas de transporte sem imprimir URL completa, headers ou credenciais.
function getNetworkCause(error) {
  let current = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current.code || current.errno) return current;
    current = current.cause;
  }
  return error?.cause || error;
}

const RETRYABLE_DNS_CODES = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED']);
const SAFE_RETRY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

async function diagnosticFetch(input, init) {
  const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  let requestUrl = '';
  try { requestUrl = input instanceof Request ? input.url : String(input); } catch {}
  let parsedUrl = null;
  try { parsedUrl = new URL(requestUrl); } catch {}

  // Retry reads on transient connection failures. For writes, retry only DNS/connect
  // failures that prove the request could not have reached Supabase, avoiding duplicates.
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      const networkCause = getNetworkCause(error);
      const causeCode = networkCause?.code || networkCause?.errno || null;
      const retryAllowed = SAFE_RETRY_METHODS.has(method) || RETRYABLE_DNS_CODES.has(causeCode);
      if (attempt < maxAttempts && retryAllowed) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** (attempt - 1))));
        continue;
      }
      console.error('[Supabase Admin] Falha de conexão HTTP:', {
        host: parsedUrl?.hostname || null,
        path: parsedUrl?.pathname || null,
        method,
        attempt,
        error: error?.message || String(error),
        cause: networkCause?.message || error?.cause?.message || null,
        causeCode,
        errno: networkCause?.errno || null,
        syscall: networkCause?.syscall || null,
        hostname: networkCause?.hostname || null,
      });
      throw error;
    }
  }
}

export const supabaseAdmin = hasSupabaseAdminConfig
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: { fetch: diagnosticFetch },
    })
  : null;
