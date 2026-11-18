import 'server-only';

import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const value = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!value.trim()) return '';
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:') {
      console.error('[Supabase Admin] A URL configurada precisa usar HTTPS.');
      return '';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    console.error('[Supabase Admin] URL do Supabase inválida nas variáveis de ambiente.');
    return '';
  }
}

const supabaseUrl = getSupabaseUrl();
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
