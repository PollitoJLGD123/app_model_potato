import api from "@/lib/axios";
import {
  MultiModelEvaluationResponse,
  RoboflowEvaluationResponse,
  PredictionHistoryResponse,
  SurcosResponse,
} from "@/types/evaluation";

export const evaluationImage = async (
  image: File,
): Promise<MultiModelEvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);

  const response = await api.post<MultiModelEvaluationResponse>(
    "/evaluation/evaluate",
    formData,
  );

  return response.data;
};

export const evaluationRoboflow = async (
  image: File,
  surco_id?: number,
): Promise<RoboflowEvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);
  if (surco_id) {
    formData.append("surco_id", surco_id.toString());
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

export const getSurcos = async (): Promise<SurcosResponse> => {
  const response = await api.get<SurcosResponse>("/evaluation/surcos");
  return response.data;
};
