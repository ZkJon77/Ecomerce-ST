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

export const supabaseAdmin = hasSupabaseAdminConfig
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
