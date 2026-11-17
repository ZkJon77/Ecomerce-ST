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

async function recordColorSearches(items, manufacturer, model) {
  if (!hasSupabaseAdminConfig || !items?.length) return;
  await Promise.all(items.slice(0, MAX_RESULTS).map((item) =>
    supabaseAdmin.rpc("record_automotive_color_search", {
      p_source_color_id: String(item.source_reference || item.id),
      p_manufacturer: manufacturer || item.manufacturer,
      p_model: model || item.model,
      p_color_name: item.color_name || item.name || "Cor automotiva",
      p_manufacturer_code: item.color_code && item.color_code !== "Código não informado" ? item.color_code : (item.manufacturer_code || null),
      p_hex_code: /^#[0-9a-f]{6}$/i.test(item.color_hex || item.hex_code || "") ? (item.color_hex || item.hex_code) : null,
    }).then(({ error }) => {
      if (error) console.error("[automotive-colors] Search statistic write failed:", error.message);
    })
  ));
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
  const action = params.get("action");

  // Catálogo estruturado importado da planilha Silver Tintas.
  if (action === "makes") {
    if (!hasSupabaseAdminConfig) {
      return NextResponse.json({ error: "Catálogo indisponível: configure a conexão administrativa do Supabase." }, { status: 503 });
    }
    const { data, error } = await supabaseAdmin
      .from("automotive_reference_makes")
      .select("id,group_name,brand,country,models_count,colors_count")
      .order("brand");
    if (error) {
      console.error("[automotive-colors] Reference makes failed:", error.message);
      return NextResponse.json({ error: "Não foi possível carregar as montadoras." }, { status: 500 });
    }
    return NextResponse.json({ makes: data || [], count: data?.length || 0, source: "Planilha de referência Silver Tintas" });
  }

  if (action === "models") {
    if (!hasSupabaseAdminConfig) return NextResponse.json({ error: "Catálogo indisponível: configure a conexão administrativa do Supabase." }, { status: 503 });
    const makeId = (params.get("makeId") || "").trim();
    if (!makeId) return NextResponse.json({ error: "Selecione uma montadora." }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("automotive_reference_models")
      .select("id,model,segment")
      .eq("make_id", makeId)
      .order("model");
    if (error) {
      console.error("[automotive-colors] Reference models failed:", error.message);
      return NextResponse.json({ error: "Não foi possível carregar os modelos." }, { status: 500 });
    }
    return NextResponse.json({ models: data || [], count: data?.length || 0 });
  }

  if (action === "reference-colors") {
    const makeId = (params.get("makeId") || "").trim();
    const modelId = (params.get("modelId") || "").trim();
    const code = (params.get("code") || "").trim().slice(0, 60);
    const query = (params.get("q") || "").trim().slice(0, 100);
    const yearValue = (params.get("year") || "").trim();
    const year = yearValue ? Number(yearValue) : null;
    if (!makeId || !modelId) {
      return NextResponse.json({ error: "Selecione a montadora e o modelo." }, { status: 400 });
    }
    if (yearValue && (!Number.isInteger(year) || year < 1950 || year > 2035)) {
      return NextResponse.json({ error: "Informe um ano válido para o veículo." }, { status: 400 });
    }
    const { data: modelRecord, error: modelError } = await supabaseAdmin
      .from("automotive_reference_models")
      .select("id,make_id,model,segment")
      .eq("id", modelId)
      .eq("make_id", makeId)
      .maybeSingle();
    if (modelError || !modelRecord) {
      return NextResponse.json({ error: "O modelo selecionado não pertence à montadora informada." }, { status: 400 });
    }
    const { data: makeRecord, error: makeError } = await supabaseAdmin
      .from("automotive_reference_makes")
      .select("id,brand")
      .eq("id", makeId)
      .maybeSingle();
    if (makeError || !makeRecord) {
      return NextResponse.json({ error: "Montadora não encontrada no catálogo." }, { status: 404 });
    }
    const { data: links, error: linksError } = await supabaseAdmin
      .from("automotive_reference_model_colors")
      .select("color_id")
      .eq("model_id", modelId);
    if (linksError) {
      console.error("[automotive-colors] Reference links failed:", linksError.message);
      return NextResponse.json({ error: "Não foi possível consultar as cores deste modelo." }, { status: 500 });
    }
    const colorIds = (links || []).map((item) => item.color_id);
    if (!colorIds.length) {
      return NextResponse.json({ results: [], count: 0, source: "Planilha de referência Silver Tintas", notice: "Não há cores relacionadas a este modelo na planilha." });
    }
    const { data: colorRows, error: colorError } = await supabaseAdmin
      .from("automotive_reference_colors")
      .select("id,color_name,color_family,original_name,factory_code,data_confidence")
      .eq("make_id", makeId)
      .in("id", colorIds)
      .order("color_name");
    if (colorError) {
      console.error("[automotive-colors] Reference colors failed:", colorError.message);
      return NextResponse.json({ error: "Não foi possível carregar as cores." }, { status: 500 });
    }
    let filtered = colorRows || [];
    if (code) {
      const normalized = code.toLowerCase();
      filtered = filtered.filter((item) => (item.factory_code || "").toLowerCase().includes(normalized));
    } else if (query) {
      const normalized = query.toLowerCase();
      filtered = filtered.filter((item) =>
        [item.color_name, item.original_name, item.factory_code, item.color_family]
          .some((value) => (value || "").toLowerCase().includes(normalized))
      );
    }
    const results = filtered.slice(0, MAX_RESULTS).map((item) => ({
      id: item.id,
      source_reference: item.id,
      manufacturer: makeRecord.brand,
      model: modelRecord.model,
      year_start: null,
      year_end: null,
      color_code: item.factory_code || "Código não informado",
      color_name: item.color_name,
      color_group: item.color_family || null,
      color_hex: null,
      finish: null,
      paint_system: null,
      notes: (item.data_confidence || "").startsWith("Genérica")
        ? "Cor genérica para referência visual; não representa uma opção oficial confirmada pelo fabricante."
        : "Nome de referência ainda não conferido em catálogo oficial. Confirme a nomenclatura e o código na etiqueta do veículo.",
      source_name: "Planilha de referência Silver Tintas",
      verified_at: null,
    }));
    await recordColorSearches(results, makeRecord.brand, modelRecord.model);
    return NextResponse.json({
      results,
      count: results.length,
      source: "Planilha de referência Silver Tintas",
      notice: "A planilha contém nomes de referência e associações por montadora/modelo, mas a maioria dos registros ainda não foi conferida em catálogo oficial. Códigos ausentes não foram inventados. A aplicação por ano/versão deve ser confirmada na etiqueta do veículo.",
      confidence: "reference_unverified",
    });
  }

  if (params.get("popular") === "1") {
    if (!hasSupabaseAdminConfig) {
      return NextResponse.json({ error: "O catálogo de destaques está temporariamente indisponível." }, { status: 503 });
    }
    const [{ data: vehicles, error: vehiclesError }, { data: popularColors, error: colorsError }] = await Promise.all([
      supabaseAdmin.from("automotive_featured_vehicles")
        .select("manufacturer,model,sales_rank,reference_month,source_name,source_url")
        .eq("active", true).order("sales_rank").limit(12),
      supabaseAdmin.from("automotive_color_search_stats")
        .select("source_color_id,manufacturer,model,color_name,manufacturer_code,hex_code,searches,last_searched_at")
        .order("searches", { ascending: false }).order("last_searched_at", { ascending: false }).limit(12),
    ]);
    if (vehiclesError || colorsError) {
      console.error("[automotive-colors] Popular section read failed:", vehiclesError?.message || colorsError?.message);
      return NextResponse.json({ error: "Não foi possível carregar os destaques automotivos." }, { status: 500 });
    }
    return NextResponse.json({
      vehicles: vehicles || [],
      popularColors: popularColors || [],
      popularityBasis: "Modelos: ranking Fenabrave de outubro/2026. Cores: pesquisas reais registradas no site.",
    });
  }

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

  const existingCache = await readCachedColors(manufacturer, modelName, code, query, year).catch(() => null);
  if (existingCache?.fresh) {
    await recordColorSearches(existingCache.results, manufacturer, modelName);
    return NextResponse.json({
      ...existingCache,
      notice: "Resultados servidos pelo cache atualizado do Supabase. " + existingCache.notice,
    });
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

    let cachePersisted = false;
    try {
      await saveMakeAndModel(make, foundModel);
      await saveColors(foundModel.id, catalogColors);
      cachePersisted = hasSupabaseAdminConfig;
    } catch (cacheError) {
      console.error("[automotive-colors] Supabase cache write failed:", cacheError.message);
    }

    await recordColorSearches(filtered.slice(0, MAX_RESULTS).map((item) => ({
      source_reference: item.id,
      color_name: item.name,
      color_code: item.manufacturerCode,
      color_hex: item.hexCode,
    })), make.name, foundModel.name);

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
      cached: cachePersisted,
      notice: results.length
        ? "Catálogo automotivo público. Os dados foram consultados na fonte e armazenados em cache quando o Supabase está configurado. Não há fórmula de mistura nem confirmação por ano/versão."
        : "Nenhuma cor correspondente encontrada. O catálogo pode não conter todos os veículos vendidos no Brasil.",
    });
  } catch (error) {
    console.error("[automotive-colors] Public catalog lookup failed:", error.message);
    const cached = await readCachedColors(manufacturer, modelName, code, query, year).catch(() => null);
    if (cached) {
      await recordColorSearches(cached.results, manufacturer, modelName);
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
