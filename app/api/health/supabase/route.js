import { NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return NextResponse.json({
      ok: false,
      service: 'supabase',
      stage: 'configuration',
      message: 'Configuração administrativa do Supabase ausente. Verifique URL e chave no ambiente da Vercel.',
      hasProjectUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      hasAdminKey: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    }, { status: 503 });
  }

  let host = null;
  try {
    host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).hostname;
    const { error } = await supabaseAdmin.from('orders').select('id').limit(1);
    if (error) {
      console.error('[Supabase Health] Consulta de diagnóstico falhou:', {
        code: error.code || null,
        message: error.message || null,
        details: error.details || null,
        hint: error.hint || null,
        host,
      });
      return NextResponse.json({
        ok: false,
        service: 'supabase',
        stage: 'database_query',
        host,
        code: error.code || null,
        message: error.message || 'Falha ao consultar a tabela orders.',
        details: error.details || null,
        hint: error.hint || null,
      }, { status: 503 });
    }

    return NextResponse.json({ ok: true, service: 'supabase', stage: 'connected', host });
  } catch (error) {
    console.error('[Supabase Health] Conexão falhou:', {
      message: error?.message || String(error),
      cause: error?.cause?.message || null,
      causeCode: error?.cause?.code || null,
      errno: error?.cause?.errno || null,
      syscall: error?.cause?.syscall || null,
      hostname: error?.cause?.hostname || null,
      host,
    });
    return NextResponse.json({
      ok: false,
      service: 'supabase',
      stage: 'network_connection',
      host,
      message: error?.message || 'Falha de conexão com Supabase.',
      cause: error?.cause?.message || null,
      causeCode: error?.cause?.code || null,
      hostname: error?.cause?.hostname || null,
    }, { status: 503 });
  }
}
