/**
 * Lista modelos disponibles en la API de Gemini y selecciona uno para generateContent.
 * Útil cuando el modelo por defecto (ej. gemini-1.5-pro) está deprecado o no disponible.
 */

const MODELS_API = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiModel {
  name: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
  supported_generation_methods?: string[];
}

interface ListModelsResponse {
  models?: GeminiModel[];
  nextPageToken?: string;
}

/** Orden de preferencia: Pro > Flash, versiones más recientes primero */
const PREFERRED_PREFIXES = [
  "gemini-2.5-pro",
  "gemini-2.0-pro",
  "gemini-1.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

let cachedModel: string | null = null;

/**
 * Obtiene la lista de modelos disponibles y selecciona uno que soporte generateContent.
 * Prioriza modelos Pro para análisis de video.
 */
export async function getModelForGenerateContent(): Promise<string> {
  if (cachedModel) {
    return cachedModel;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
  }

  const url = `${MODELS_API}?key=${apiKey}&pageSize=100`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error al listar modelos Gemini: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ListModelsResponse;
  const models = data.models ?? [];

  const methods = (m: GeminiModel) =>
    m.supportedGenerationMethods ?? m.supported_generation_methods ?? [];

  const supported = models.filter((m) => methods(m).includes("generateContent"));

  if (supported.length === 0) {
    throw new Error(
      "No se encontraron modelos Gemini que soporten generateContent. Verifica tu API key."
    );
  }

  // Extraer nombre corto (sin prefix "models/")
  const getShortName = (name: string) =>
    name.startsWith("models/") ? name.slice(7) : name;

  // Priorizar por lista de preferencia
  for (const prefix of PREFERRED_PREFIXES) {
    const match = supported.find((m) => {
      const short = getShortName(m.name);
      return short === prefix || short.startsWith(prefix + "-");
    });
    if (match) {
      cachedModel = getShortName(match.name);
      return cachedModel;
    }
  }

  // Fallback: primer modelo que soporte generateContent
  cachedModel = getShortName(supported[0].name);
  return cachedModel;
}

/**
 * Limpia la caché para forzar una nueva consulta en la próxima llamada.
 */
export function clearModelCache(): void {
  cachedModel = null;
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName?: string;
}

let cachedModelsList: ModelInfo[] | null = null;

/**
 * Lista todos los modelos disponibles que soportan generateContent.
 * Retorna id (nombre corto), name y displayName para el selector.
 */
export async function listGeminiModels(): Promise<ModelInfo[]> {
  if (cachedModelsList) {
    return cachedModelsList;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
  }

  const url = `${MODELS_API}?key=${apiKey}&pageSize=100`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error al listar modelos Gemini: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ListModelsResponse;
  const models = data.models ?? [];

  const methods = (m: GeminiModel) =>
    m.supportedGenerationMethods ?? m.supported_generation_methods ?? [];

  const supported = models.filter((m) => methods(m).includes("generateContent"));

  const getShortName = (name: string) =>
    name.startsWith("models/") ? name.slice(7) : name;

  cachedModelsList = supported.map((m) => ({
    id: getShortName(m.name),
    name: m.name,
    displayName: m.displayName ?? getShortName(m.name),
  }));

  // Ordenar: Pro primero, luego Flash, por nombre
  cachedModelsList.sort((a, b) => {
    const aPro = a.id.includes("pro") ? 0 : 1;
    const bPro = b.id.includes("pro") ? 0 : 1;
    if (aPro !== bPro) return aPro - bPro;
    return a.id.localeCompare(b.id);
  });

  return cachedModelsList;
}
