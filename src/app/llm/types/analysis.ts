/**
 * Tipos para el resultado del análisis de video con Gemini.
 * Esquema esperado del JSON estructurado devuelto por el modelo.
 */

export interface AnalisisGeneral {
  total_hojas: number;
  sanas: number;
  enfermas: number;
}

export interface SegmentoAnalizado {
  tiempo_inicio: number;
  tiempo_fin: number;
  confianza_porcentaje: number;
  enfermedad_detectada: string;
}

export interface TimelineAnotacion {
  segundo: number;
  juicio_experto: string;
  recomendacion: string;
}

export interface AnalysisResult {
  analisis_general: AnalisisGeneral;
  segmentos_analizados: SegmentoAnalizado[];
  timeline_anotaciones: TimelineAnotacion[];
}
