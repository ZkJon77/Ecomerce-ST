import { createClient } from '@supabase/supabase-js';

const CANONICAL_SUPABASE_URL = 'https://abaantdokbnqabxierac.supabase.co';
const configuredPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';

if (configuredPublicUrl) {
  try {
    if (new URL(configuredPublicUrl).hostname !== 'abaantdokbnqabxierac.supabase.co') {
      console.error('[Supabase] NEXT_PUBLIC_SUPABASE_URL aponta para outro projeto; usando o projeto oficial deste e-commerce.');
    }
  } catch {
    console.error('[Supabase] NEXT_PUBLIC_SUPABASE_URL inválida; usando o projeto oficial deste e-commerce.');
  }
}

const SUPABASE_URL = CANONICAL_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const hasSupabasePublicConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function createSupabaseClient(url, key, clientName) {
  if (!url || !key) {
    console.error(
      `[Supabase] ${clientName} não inicializado: configure NEXT_PUBLIC_SUPABASE_URL e uma chave pública NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.`
    );
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Supabase public configuration is missing or invalid.' } }),
        signOut: async () => ({ data: null, error: { message: 'Supabase public configuration is missing or invalid.' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase public configuration is missing or invalid.' } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase public configuration is missing or invalid.' } }),
        getSession: async () => ({ data: { session: null }, error: { message: 'Supabase public configuration is missing or invalid.' } }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase public configuration is missing or invalid.' } }),
      },
      from: () => { throw new Error('Supabase public configuration is missing or invalid.'); },
    };
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.error(`[Supabase] Erro ao inicializar ${clientName}:`, error);
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error }),
        signOut: async () => ({ data: null, error }),
        signInWithPassword: async () => ({ data: null, error }),
        signUp: async () => ({ data: null, error }),
        getSession: async () => ({ data: { session: null }, error }),
        resetPasswordForEmail: async () => ({ data: null, error }),
      },
      from: () => { throw error; },
    };
  }
}

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, 'Public Client');
