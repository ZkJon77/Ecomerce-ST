import 'server-only';

import { createClient } from '@supabase/supabase-js';

function getValidSupabaseUrl() {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    try {
      const url = new URL(candidate.trim());
      if ((url.protocol === 'https:' || url.protocol === 'http:') && url.hostname) {
        return url.origin;
      }
    } catch {
      // Tenta a próxima variável caso a primeira esteja vazia ou inválida.
    }
  }
  return '';
}

const supabaseUrl = getValidSupabaseUrl();
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
