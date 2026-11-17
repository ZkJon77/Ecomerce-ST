import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig, supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const API_BASE = "https://fleetcatalog.disturbingbyte.pt";
const MAX_RESULTS = 50;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function catalogGet(path) {
  const response = await fetch(API_BASE + path, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || "A base pública de veículos não respondeu.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function isFresh(timestamp) {
  return timestamp && Date.now() - new Date(timestamp).getTime() < CACHE_TTL_MS;
}

function normalizeColor(item, manufacturer, model, year) {
  return {
    id: "fleetbyte-" + item.source_id,
    manufacturer,
    model,
    year_start: null,
    year_end: null,
    color_code: item.manufacturer_code || "Código não informado",
    color_name: item.name || "Cor automotiva",
    color_group: null,
    color_hex: /^#[0-9a-f]{6}$/i.test(item.hex_code || "") ? item.hex_code : null,
    finish: null,
    paint_system: null,
    notes: year
      ? "A API lista cores por modelo, mas não confirma a aplicação no ano " + year + ". Confira a etiqueta do veículo."
      : "Referência de cor por modelo. Confirme o código na etiqueta do veículo antes da preparação.",
    source_name: "fleetByte Catalog API",
    source_reference: item.source_id,
    verified_at: null,
  };
}

async function saveMakeAndModel(make, model) {
  if (!hasSupabaseAdminConfig) return;
  const now = new Date().toISOString();
  const { error: makeError } = await supabaseAdmin
    .from("automotive_catalog_makes")
    .upsert({
      source_id: String(make.id),
      name: make.name,
      country_code: make.country || null,
      synced_at: now,
    }, { onConflict: "source_id" });
  if (makeError) throw makeError;

  const { error: modelError } = await supabaseAdmin
    .from("automotive_catalog_models")
    .upsert({
      source_id: String(model.id),
      make_source_id: String(make.id),
      name: model.name,
      synced_at: now,
    }, { onConflict: "source_id" });
  if (modelError) throw modelError;
}

async function saveColors(modelId, colors) {
  if (!hasSupabaseAdminConfig || !colors.length) return;
  const now = new Date().toISOString();
  const rows = colors.map((item) => ({
    source_id: String(item.id),
    model_source_id: String(modelId),
    name: item.name || "Cor automotiva",
    manufacturer_code: item.manufacturerCode || null,
    hex_code: /^#[0-9a-f]{6}$/i.test(item.hexCode || "") ? item.hexCode : null,
    source_name: "fleetByte Catalog API",
    synced_at: now,
  }));
  const { error } = await supabaseAdmin
    .from("automotive_catalog_colors")
    .upsert(rows, { onConflict: "source_id" });
  if (error) throw error;
}

async function readCachedColors(makeName, modelName, code, query, year) {
  if (!hasSupabaseAdminConfig) return null;
  const { data: make } = await supabaseAdmin
    .from("automotive_catalog_makes")
    .select("source_id,name")
    .ilike("name", makeName)
    .limit(1)
    .maybeSingle();
  if (!make) return null;

  const { data: model } = await supabaseAdmin
    .from("automotive_catalog_models")
    .select("source_id,name,synced_at")
    .eq("make_source_id", make.source_id)
    .ilike("name", modelName)
    .limit(1)
    .maybeSingle();
  if (!model) return null;

  const { data: colors, error } = await supabaseAdmin
    .from("automotive_catalog_colors")
    .select("source_id,name,manufacturer_code,hex_code,synced_at")
    .eq("model_source_id", model.source_id)
    .order("name")
    .limit(100);
  if (error || !colors?.length) return null;

  let filtered = colors;
  if (code) {
    const normalized = code.toLowerCase();
    filtered = filtered.filter((item) => (item.manufacturer_code || "").toLowerCase().includes(normalized));
  } else if (query) {
    const normalized = query.toLowerCase();
    filtered = filtered.filter((item) =>
      (item.name || "").toLowerCase().includes(normalized)
      || (item.manufacturer_code || "").toLowerCase().includes(normalized)
    );
  }

  const results = filtered.slice(0, MAX_RESULTS).map((item) => normalizeColor(item, make.name, model.name, year));
  return {
    results,
    count: results.length,
    source: "Supabase · cache fleetByte",
    cached: true,
    notice: "Resultados recuperados do cache do catálogo público. Confirme o código na etiqueta do veículo; não são fórmulas de mistura.",
    fresh: colors.every((item) => isFresh(item.synced_at)) && isFresh(model.synced_at),
  };
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const code = (params.get("code") || "").trim().slice(0, 60);
  const manufacturer = (params.get("manufacturer") || "").trim().slice(0, 80);
  const modelName = (params.get("model") || "").trim().slice(0, 80);
  const query = (params.get("q") || "").trim().slice(0, 100);
  const yearValue = (params.get("year") || "").trim();
  const year = yearValue ? Number(yearValue) : null;

  if (yearValue && (!Number.isInteger(year) || year < 1950 || year > 2035)) {
    return NextResponse.json({ error: "Informe um ano válido para o veículo." }, { status: 400 });
  }
  if (!manufacturer || !modelName) {
    return NextResponse.json({
      error: "Informe a montadora e o modelo. A base gratuita não oferece pesquisa global de códigos.",
    }, { status: 400 });
  }

  try {
    const makePayload = await catalogGet("/v1/makes?search=" + encodeURIComponent(manufacturer) + "&pageSize=100");
    const makes = makePayload.items || [];
    const make = makes.find((item) => item.name?.toLowerCase() === manufacturer.toLowerCase())
      || makes.find((item) => item.name?.toLowerCase().includes(manufacturer.toLowerCase()));

    if (!make) {
      return NextResponse.json({ results: [], count: 0, source: "fleetByte Catalog API", notice: "Montadora não encontrada no catálogo público." });
    }

    const modelPayload = await catalogGet("/v1/makes/" + encodeURIComponent(make.id) + "/models?search=" + encodeURIComponent(modelName) + "&pageSize=100");
    const models = modelPayload.items || [];
    const foundModel = models.find((item) => item.name?.toLowerCase() === modelName.toLowerCase())
      || models.find((item) => item.name?.toLowerCase().includes(modelName.toLowerCase()));

    if (!foundModel) {
      return NextResponse.json({ results: [], count: 0, source: "fleetByte Catalog API", notice: "Modelo não encontrado no catálogo público para essa montadora." });
    }

    const colorPayload = await catalogGet("/v1/models/" + encodeURIComponent(foundModel.id) + "/colors?pageSize=100");
    const catalogColors = colorPayload.items || [];
    let filtered = catalogColors;
    if (code) {
      const normalized = code.toLowerCase();
      filtered = filtered.filter((item) => (item.manufacturerCode || "").toLowerCase().includes(normalized));
    } else if (query) {
      const normalized = query.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.name || "").toLowerCase().includes(normalized)
        || (item.manufacturerCode || "").toLowerCase().includes(normalized)
      );
    }

    try {
      await saveMakeAndModel(make, foundModel);
      await saveColors(foundModel.id, catalogColors);
    } catch (cacheError) {
      console.error("[automotive-colors] Supabase cache write failed:", cacheError.message);
    }

    const results = filtered.slice(0, MAX_RESULTS).map((item) => ({
      ...normalizeColor({
        source_id: item.id,
        name: item.name,
        manufacturer_code: item.manufacturerCode,
        hex_code: item.hexCode,
      }, make.name, foundModel.name, year),
    }));

    return NextResponse.json({
      results,
      count: colorPayload.total ?? results.length,
      source: "fleetByte Catalog API",
      cached: hasSupabaseAdminConfig,
      notice: results.length
        ? "Catálogo automotivo público. Os dados foram consultados na fonte e armazenados em cache quando o Supabase está configurado. Não há fórmula de mistura nem confirmação por ano/versão."
        : "Nenhuma cor correspondente encontrada. O catálogo pode não conter todos os veículos vendidos no Brasil.",
    });
  } catch (error) {
    console.error("[automotive-colors] Public catalog lookup failed:", error.message);
    const cached = await readCachedColors(manufacturer, modelName, code, query, year).catch(() => null);
    if (cached) {
      return NextResponse.json({
        ...cached,
        notice: "A fonte pública está indisponível; estes resultados vêm do cache do Supabase. " + cached.notice,
      });
    }
    return NextResponse.json({
      error: error.status === 429
        ? "O limite público de consultas foi atingido e ainda não há cache para este veículo. Tente novamente mais tarde."
        : "Não foi possível consultar o catálogo público e não há dados em cache para este veículo.",
    }, { status: error.status === 429 ? 503 : 502 });
  }
}
