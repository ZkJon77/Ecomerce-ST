import { createClient } from '@supabase/supabase-js';

/**
 * Configurações do Supabase extraídas do ambiente.
 * Fornece strings vazias como fallback para evitar erros de tipo durante a inicialização.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Fábrica de clientes Supabase.
 * Esta função garante que a aplicação não trave (crash) caso as chaves de API
 * não estejam configuradas no .env.local.
 * Se as chaves estiverem ausentes, ela retorna um "Mock Client" que simula o
 * comportamento do SDK do Supabase, permitindo que o site continue funcionando
 * com dados locais (constants.ts).
 */
function createSupabaseClient(url, key, clientName) {
  if (!url || !key) {
    console.warn(`[Supabase] ${clientName} keys are missing. Application will use local fallback data.`);

    // Mock Client: Simula a interface do Supabase para evitar "undefined" errors
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Config missing' } }),
        signOut: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Config missing' } }),
        getSession: async () => ({ data: { session: null }, error: { message: 'Config missing' } }),
      },
      from: (table) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: `Table ${table} not available (keys missing)` } }),
            // Suporte a encadeamento para queries de lista
            select: () => ({
              eq: () => ({
                single: async () => ({ data: null, error: { message: 'Config missing' } })
              })
            })
          })
        }),
      }),
    };
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.error(`[Supabase] Error initializing ${clientName}:`, error);
    return null; // Ou retornar o mock client acima
  }
}

// Cliente Público: Usado no Frontend para autenticação e leitura de dados públicos.
export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, 'Public Client');

// Cliente Admin: Usado apenas no Backend/API para operações administrativas (bypass de RLS).
export const supabaseAdmin = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, 'Admin Client');
