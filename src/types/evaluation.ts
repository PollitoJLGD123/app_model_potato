export interface EvaluationResult {
  clase_predicha: string;
  confianza: number;
  todas_predicciones: {
    [key: string]: number;
  };
}

export interface EvaluationResponse {
  data: EvaluationResult;
  message: string;
  status_code: number;
}
