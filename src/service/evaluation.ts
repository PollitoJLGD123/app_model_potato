import api from "@/lib/axios";
import {
  EvaluationResponse,
  RoboflowEvaluationResponse,
} from "@/types/evaluation";

export const evaluationImage = async (image: File): Promise<EvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);

  const response = await api.post<EvaluationResponse>(
    "/evaluation/evaluate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const evaluationRoboflow = async (
  image: File
): Promise<RoboflowEvaluationResponse> => {
  const formData = new FormData();
  formData.append("file", image);

  const response = await api.post<RoboflowEvaluationResponse>(
    "/evaluation/roboflow",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
