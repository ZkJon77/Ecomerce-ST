import 'server-only';

import { createClient } from '@supabase/supabase-js';

// Este módulo só pode ser importado por rotas/ações executadas no servidor.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

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
