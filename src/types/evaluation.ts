// ── Resultado individual de un modelo ────────────────────────────
export interface ModelResult {
  modelo: string;
  clase_predicha: string;
  confianza: number;
  todas_predicciones: { [key: string]: number };
  metricas_entrenamiento: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
}

// ── Resumen comparativo entre modelos ───────────────────────────
export interface ComparativeSummary {
  consenso: boolean;
  clase_consenso: string | null;
  modelo_mas_confiado: string;
  confianza_maxima: number;
}

// ── Respuesta multi-modelo del /evaluation/evaluate ─────────────
export interface MultiModelEvaluationResult {
  mejor_modelo_global: string;
  resultados: { [modelName: string]: ModelResult };
  resumen_comparativo: ComparativeSummary;
}

export interface MultiModelEvaluationData {
  clasificacion: MultiModelEvaluationResult;
  prediccion: PrediccionRecord;
}

export interface MultiModelEvaluationResponse {
  data: MultiModelEvaluationData;
  message: string;
  status: "success" | "error";
}

// ── Roboflow ────────────────────────────────────────────────────
export interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number | null;
  detection_id: string | null;
}

export interface RoboflowDetection {
  source: "file" | "url";
  model_id: string;
  predictions: RoboflowPrediction[];
  has_matches: boolean;
}

export interface Fase1Resumen {
  has_matches: boolean;
  total_detecciones: number;
  clases_detectadas: string[];
}

export interface Fase2Resumen {
  modelo: string;
  clase_predicha: string;
  confianza: number;
}

export interface PrediccionRecord {
  id: number;
  surco_id: number | null;
  usuario_id: number;
  periodo_id: number | null;
  imagen_url: string;
  fase1_resumen: Fase1Resumen | null;
  fase1_payload: RoboflowDetection | null;
  fase2_resumen: Fase2Resumen | null;
  fase2_payload: MultiModelEvaluationResult | null;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface PredictionHistoryResponse {
  data: PrediccionRecord[];
  status: "success" | "error";
  message: string;
}

export interface RoboflowEvaluationResponse {
  data: RoboflowDetection;
  message: string;
  status: "success" | "error";
}

export interface Surco {
  id: number;
  numero: number;
  descripcion: string | null;
  lote_id: number;
  lote_identificador: string;
  modulo_id: number;
  modulo_nombre: string;
}

export interface SurcosResponse {
  data: Surco[];
  message: string;
  status: "success" | "error";
}

// ── Diagnóstico agregado / recomendaciones ────────────────────────

export interface DiagnosisReportSummary {
  id: number;
  fecha: string;
  indice_severidad: number;
  tendencia: string;
  clase_reciente: string | null;
}

export interface DiagnosisRecommendationRecord {
  id: number;
  titulo: string | null;
  contenido: string;
  severidad: string | null;
  etiquetas: string[] | null;
  fecha: string;
  created_at: string;
  updated_at: string;
  report?: DiagnosisReportSummary;
}

export interface DiagnosisRecommendationsResponse {
  data: DiagnosisRecommendationRecord[];
  status: "success" | "error";
  message: string;
}

export interface Periodo {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  usuario_id: number;
  created_at: string | null;
  updated_at: string | null;
}
