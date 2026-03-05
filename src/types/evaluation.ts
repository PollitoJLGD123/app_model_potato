export interface LocalEvaluationResult {
  clase_predicha: string;
  confianza: number;
  todas_predicciones: {
    [key: string]: number;
  };
}

export interface LocalEvaluationResponse {
  data: LocalEvaluationResult;
  message: string;
  status: "success" | "error";
}

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

export interface RoboflowEvaluationResult {
  source: "file" | "url";
  model_id: string;
  predictions: RoboflowPrediction[];
  has_matches: boolean;
}

export interface RoboflowEvaluationResponse {
  data: RoboflowEvaluationResult;
  message: string;
  status: "success" | "error";
}

// Backward compatible aliases used by the current evaluation page.
export type EvaluationResult = LocalEvaluationResult;
export type EvaluationResponse = LocalEvaluationResponse;
