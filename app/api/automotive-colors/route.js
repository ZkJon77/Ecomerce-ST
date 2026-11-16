import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 50;

export async function GET(request) {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return NextResponse.json(
      { error: "A consulta automotiva ainda não está conectada ao banco de dados." },
      { status: 503 }
    );
  }

  const params = new URL(request.url).searchParams;
  const code = (params.get("code") || "").trim().slice(0, 60);
  const manufacturer = (params.get("manufacturer") || "").trim().slice(0, 80);
  const model = (params.get("model") || "").trim().slice(0, 80);
  const yearValue = (params.get("year") || "").trim();
  const group = (params.get("group") || "").trim().slice(0, 50);
  const query = (params.get("q") || "").trim().slice(0, 100);

  const year = yearValue ? Number(yearValue) : null;
  if (yearValue && (!Number.isInteger(year) || year < 1950 || year > 2035)) {
    return NextResponse.json({ error: "Informe um ano válido para o veículo." }, { status: 400 });
  }

  if (!code && !manufacturer && !model && !year && !group && !query) {
    return NextResponse.json({ error: "Informe um código ou pelo menos um filtro de veículo." }, { status: 400 });
  }

  try {
    let dbQuery = supabaseAdmin
      .from("automotive_color_formulas")
      .select("id, manufacturer, model, year_start, year_end, color_code, color_name, color_group, color_hex, finish, paint_system, notes, source_name, verified_at")
      .eq("is_active", true)
      .order("manufacturer", { ascending: true })
      .order("model", { ascending: true })
      .limit(MAX_RESULTS);

    if (code) dbQuery = dbQuery.ilike("color_code", code);
    if (manufacturer) dbQuery = dbQuery.ilike("manufacturer", "%" + manufacturer.replace(/[%_]/g, "") + "%");
    if (model) dbQuery = dbQuery.ilike("model", "%" + model.replace(/[%_]/g, "") + "%");
    if (year) {
      dbQuery = dbQuery.lte("year_start", year).gte("year_end", year);
    }
    if (group) dbQuery = dbQuery.ilike("color_group", "%" + group.replace(/[%_]/g, "") + "%");
    if (query) {
      const safeQuery = query.replace(/[%_]/g, "");
      dbQuery = dbQuery.or("color_name.ilike.%"+safeQuery+"%,color_code.ilike.%"+safeQuery+"%,notes.ilike.%"+safeQuery+"%");
    }

    const { data, error } = await dbQuery;
    if (error) {
      console.error("[automotive-colors] Supabase query failed:", error.message);
      return NextResponse.json(
        { error: "Não foi possível consultar a base automotiva no momento." },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: data || [], count: (data || []).length });
  } catch (error) {
    console.error("[automotive-colors] Unexpected error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado ao consultar as cores." },
      { status: 500 }
    );
  }
}
