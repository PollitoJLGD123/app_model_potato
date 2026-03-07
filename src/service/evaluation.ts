import api from "@/lib/axios";
import {
  MultiModelEvaluationResponse,
  RoboflowEvaluationResponse,
  PredictionHistoryResponse,
  SurcosResponse,
  DiagnosisRecommendationsResponse,
} from "@/types/evaluation";

export const evaluationImage = async (
  image: File,
  periodo_id?: number,
): Promise<MultiModelEvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);
  if (periodo_id !== undefined) {
    formData.append("periodo_id", periodo_id.toString());
  }

  const response = await api.post<MultiModelEvaluationResponse>(
    "/evaluation/evaluate",
    formData,
  );

  return response.data;
};

export const evaluationRoboflow = async (
  image: File,
  surco_id?: number,
  periodo_id?: number,
): Promise<RoboflowEvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);
  if (surco_id) {
    formData.append("surco_id", surco_id.toString());
  }
  if (periodo_id !== undefined) {
    formData.append("periodo_id", periodo_id.toString());
  }

  const response = await api.post<RoboflowEvaluationResponse>(
    "/evaluation/roboflow",
    formData,
  );

  return response.data;
};

export const getPredictionHistory =
  async (): Promise<PredictionHistoryResponse> => {
    const response = await api.get<PredictionHistoryResponse>(
      "/evaluation/history",
    );
    return response.data;
  };

export const getPeriodos = async (): Promise<{
  data: Periodo[];
  status: string;
  message: string;
}> => {
  const response = await api.get<{
    data: Periodo[];
    status: string;
    message: string;
  }>("/periodos");
  return response.data;
};

export const createPeriodo = async (
  nombre: string,
  fecha_inicio: string,
  fecha_fin: string,
  descripcion?: string,
) => {
  const response = await api.post<{
    data: Periodo;
    status: string;
    message: string;
  }>("/periodos", { nombre, fecha_inicio, fecha_fin, descripcion });
  return response.data;
};

export const getPredictionsByPeriodo = async (
  periodoId: number,
): Promise<PredictionHistoryResponse> => {
  const response = await api.get<PredictionHistoryResponse>(
    `/periodos/${periodoId}/predicciones`,
  );
  return response.data;
};

export const getSurcos = async (): Promise<SurcosResponse> => {
  const response = await api.get<SurcosResponse>("/evaluation/surcos");
  return response.data;
};

export const createDiagnosisReport = async (payload: any) => {
  const response = await api.post("/evaluation/diagnosis", payload);
  return response.data;
};

export const getDiagnosisRecommendations =
  async (): Promise<DiagnosisRecommendationsResponse> => {
    const response = await api.get<DiagnosisRecommendationsResponse>(
      "/evaluation/diagnosis/recommendations",
    );
    return response.data;
  };
