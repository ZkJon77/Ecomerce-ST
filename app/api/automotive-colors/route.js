import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://fleetcatalog.disturbingbyte.pt";
const MAX_RESULTS = 50;

async function catalogGet(path) {
  const response = await fetch(API_BASE + path, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
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

function normalizeColor(item, manufacturer, model, year) {
  return {
    id: "fleetbyte-" + item.id,
    manufacturer,
    model,
    year_start: null,
    year_end: null,
    color_code: item.manufacturerCode || "Código não informado",
    color_name: item.name || "Cor automotiva",
    color_group: null,
    color_hex: /^#[0-9a-f]{6}$/i.test(item.hexCode || "") ? item.hexCode : null,
    finish: null,
    paint_system: null,
    notes: year
      ? "A API informa cores por modelo, mas não confirma a disponibilidade específica para o ano " + year + ". Confira a etiqueta do veículo."
      : "Referência de cor por modelo. Confirme o código na etiqueta do veículo antes da preparação.",
    source_name: "fleetByte Catalog API",
    source_reference: item.id,
    verified_at: null,
  };
}

async function findMake(name) {
  const payload = await catalogGet("/v1/makes?search=" + encodeURIComponent(name) + "&pageSize=100");
  const items = payload.items || [];
  return items.find((item) => item.name?.toLowerCase() === name.toLowerCase())
    || items.find((item) => item.name?.toLowerCase().includes(name.toLowerCase()));
}

async function findModel(makeId, name) {
  const payload = await catalogGet("/v1/makes/" + encodeURIComponent(makeId) + "/models?search=" + encodeURIComponent(name) + "&pageSize=100");
  const items = payload.items || [];
  return items.find((item) => item.name?.toLowerCase() === name.toLowerCase())
    || items.find((item) => item.name?.toLowerCase().includes(name.toLowerCase()));
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const code = (params.get("code") || "").trim().slice(0, 60);
  const manufacturer = (params.get("manufacturer") || "").trim().slice(0, 80);
  const model = (params.get("model") || "").trim().slice(0, 80);
  const query = (params.get("q") || "").trim().slice(0, 100);
  const yearValue = (params.get("year") || "").trim();
  const year = yearValue ? Number(yearValue) : null;

  if (yearValue && (!Number.isInteger(year) || year < 1950 || year > 2035)) {
    return NextResponse.json({ error: "Informe um ano válido para o veículo." }, { status: 400 });
  }

  if (!manufacturer || !model) {
    return NextResponse.json({
      error: "Para consultar cores na API gratuita, informe a montadora e o modelo do veículo. A base não oferece pesquisa global de códigos.",
    }, { status: 400 });
  }

  try {
    const make = await findMake(manufacturer);
    if (!make) {
      return NextResponse.json({
        results: [],
        count: 0,
        source: "fleetByte Catalog API",
        notice: "Montadora não encontrada no catálogo público.",
      });
    }

    const foundModel = await findModel(make.id, model);
    if (!foundModel) {
      return NextResponse.json({
        results: [],
        count: 0,
        source: "fleetByte Catalog API",
        notice: "Modelo não encontrado no catálogo público para essa montadora.",
      });
    }

    const searchTerm = code || query;
    const suffix = searchTerm ? "?search=" + encodeURIComponent(searchTerm) + "&pageSize=100" : "?pageSize=100";
    const payload = await catalogGet("/v1/models/" + encodeURIComponent(foundModel.id) + "/colors" + suffix);

    let results = (payload.items || []).map((item) =>
      normalizeColor(item, make.name, foundModel.name, year)
    );

    if (code) {
      const normalizedCode = code.toLowerCase();
      results = results.filter((item) => item.color_code.toLowerCase().includes(normalizedCode));
    }

    return NextResponse.json({
      results: results.slice(0, MAX_RESULTS),
      count: payload.total ?? results.length,
      source: "fleetByte Catalog API",
      notice: results.length
        ? "Catálogo público gratuito. Os registros mostram código e cor por modelo, mas não incluem fórmula de mistura nem confirmação de variante por ano."
        : "Nenhuma cor correspondente encontrada para esse modelo. O catálogo é comunitário e pode não conter todos os veículos vendidos no Brasil.",
    });
  } catch (error) {
    console.error("[automotive-colors] Public catalog lookup failed:", error.message);
    return NextResponse.json({
      error: error.status === 429
        ? "O limite público de consultas foi atingido. Aguarde um minuto e tente novamente."
        : "Não foi possível consultar o catálogo público agora. Tente novamente mais tarde.",
    }, { status: error.status === 429 ? 503 : 502 });
  }
}
