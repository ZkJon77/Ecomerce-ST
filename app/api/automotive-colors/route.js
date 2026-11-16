import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 50;
const MCC_BASE_URL = "https://api.mycarcolor.com";

function getMccAuthorization() {
  const key = process.env.MYCARCOLOR_API_KEY;
  const secret = process.env.MYCARCOLOR_API_SECRET;
  return key && secret ? "Bearer " + key + ":" + secret : null;
}

async function mccGet(path, authorization) {
  const response = await fetch(MCC_BASE_URL + path, {
    headers: { Authorization: authorization, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || payload.message || "A base MyCarColor recusou a consulta.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function normalizeMccHit(hit) {
  const yearMatch = String(hit.year || "").match(/^(\d{4})\s*\/\s*(\d{4})?$/);
  const finish = [
    hit.is_metallic && "Metálica",
    hit.is_pearl && "Perolizada",
    hit.is_xirallic && "Xirallic",
    hit.is_candi && "Candy",
    hit.is_special_effect && "Efeito especial",
    hit.enrichment?.is_tricoat && "Tricoat",
  ].filter(Boolean).join(", ");

  return {
    id: "mycarcolor-" + hit.color_id,
    manufacturer: hit.brand_name || (hit.brands || []).map((brand) => brand.brand_name).join(", "),
    model: hit.model_name || "",
    year_start: yearMatch ? Number(yearMatch[1]) : null,
    year_end: yearMatch?.[2] ? Number(yearMatch[2]) : null,
    color_code: hit.color_code,
    color_name: hit.color_name,
    color_group: hit.color_family,
    color_hex: hit.rgb_hex,
    finish: finish || null,
    paint_system: null,
    notes: hit.region ? "Região de referência: " + hit.region : null,
    source_name: "MyCarColor",
    source_reference: hit.color_id,
    image_url: hit.image_url || null,
    verified_at: null,
  };
}

async function searchMyCarColor({ code, manufacturer, model, year, query, group }) {
  const authorization = getMccAuthorization();
  if (!authorization) return null;

  const search = new URLSearchParams({ page: "1", page_size: "20" });
  if (code) search.set("q", code);
  else if (query) search.set("q", query);

  if (manufacturer || model) {
    if (!manufacturer) {
      throw new Error("Informe a montadora para pesquisar por modelo.");
    }

    const makes = await mccGet("/motomix/makes", authorization);
    const make = (makes.makes || []).find((item) =>
      item.brand_name.toLowerCase() === manufacturer.toLowerCase()
    ) || (makes.makes || []).find((item) =>
      item.brand_name.toLowerCase().includes(manufacturer.toLowerCase())
    );

    if (!make) return { results: [], source: "MyCarColor", notice: "Montadora não encontrada na base externa." };

    search.set("brand_id", make.brand_id);

    if (model) {
      const models = await mccGet("/motomix/makes/" + encodeURIComponent(make.brand_id) + "/models", authorization);
      const foundModel = (models.models || []).find((item) =>
        item.model_name.toLowerCase() === model.toLowerCase()
      ) || (models.models || []).find((item) =>
        item.model_name.toLowerCase().includes(model.toLowerCase())
      );

      if (!foundModel) return { results: [], source: "MyCarColor", notice: "Modelo não encontrado para essa montadora na base externa." };
      search.set("model_id", foundModel.model_id);
    }

    if (year) search.set("year", String(year));
    if (model && year) search.set("fitment", "strict");
  }

  const payload = await mccGet("/search/v3/?" + search.toString(), authorization);
  let results = (payload.hits || []).map(normalizeMccHit);
  if (group) results = results.filter((item) =>
    (item.color_group || "").toLowerCase().includes(group.toLowerCase())
  );

  return {
    results: results.slice(0, MAX_RESULTS),
    count: payload.total_hits ?? results.length,
    source: "MyCarColor",
    notice: results.length
      ? "Referências de catálogo OEM. A região e a variante devem ser confirmadas antes da preparação da tinta."
      : "Nenhuma cor correspondente foi encontrada na base externa para esses filtros.",
  };
}

async function searchLocalDatabase(filters) {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return { results: [], count: 0, source: "Silver Tintas", notice: "A API externa não está configurada e a base interna ainda não possui fórmulas cadastradas." };
  }

  let dbQuery = supabaseAdmin
    .from("automotive_color_formulas")
    .select("id, manufacturer, model, year_start, year_end, color_code, color_name, color_group, color_hex, finish, paint_system, notes, source_name, verified_at")
    .eq("is_active", true)
    .order("manufacturer", { ascending: true })
    .order("model", { ascending: true })
    .limit(MAX_RESULTS);

  if (filters.code) dbQuery = dbQuery.ilike("color_code", filters.code);
  if (filters.manufacturer) dbQuery = dbQuery.ilike("manufacturer", "%" + filters.manufacturer.replace(/[%_]/g, "") + "%");
  if (filters.model) dbQuery = dbQuery.ilike("model", "%" + filters.model.replace(/[%_]/g, "") + "%");
  if (filters.year) dbQuery = dbQuery.lte("year_start", filters.year).gte("year_end", filters.year);
  if (filters.group) dbQuery = dbQuery.ilike("color_group", "%" + filters.group.replace(/[%_]/g, "") + "%");
  if (filters.query) {
    const safeQuery = filters.query.replace(/[%_]/g, "");
    dbQuery = dbQuery.or("color_name.ilike.%"+safeQuery+"%,color_code.ilike.%"+safeQuery+"%,notes.ilike.%"+safeQuery+"%");
  }

  const { data, error } = await dbQuery;
  if (error) throw error;
  return {
    results: data || [],
    count: (data || []).length,
    source: "Silver Tintas",
    notice: data?.length ? null : "A base interna ainda não possui fórmulas verificadas para esses filtros.",
  };
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const filters = {
    code: (params.get("code") || "").trim().slice(0, 60),
    manufacturer: (params.get("manufacturer") || "").trim().slice(0, 80),
    model: (params.get("model") || "").trim().slice(0, 80),
    group: (params.get("group") || "").trim().slice(0, 50),
    query: (params.get("q") || "").trim().slice(0, 100),
  };
  const yearValue = (params.get("year") || "").trim();
  const year = yearValue ? Number(yearValue) : null;
  filters.year = year;

  if (yearValue && (!Number.isInteger(year) || year < 1950 || year > 2035)) {
    return NextResponse.json({ error: "Informe um ano válido para o veículo." }, { status: 400 });
  }
  if (!filters.code && !filters.manufacturer && !filters.model && !year && !filters.group && !filters.query) {
    return NextResponse.json({ error: "Informe um código ou pelo menos um filtro de veículo." }, { status: 400 });
  }

  try {
    const remote = await searchMyCarColor(filters);
    const result = remote || await searchLocalDatabase(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[automotive-colors] Lookup failed:", error.message);
    const status = error.status === 429 ? 503 : 502;
    return NextResponse.json({
      error: error.status === 401 || error.status === 403
        ? "A chave da base automotiva está inválida ou sem permissão. Verifique a configuração no servidor."
        : error.status === 429
          ? "Limite de consultas da base automotiva atingido. Aguarde um instante e tente novamente."
          : "Não foi possível consultar a base automotiva agora. Tente novamente mais tarde.",
    }, { status });
  }
}
