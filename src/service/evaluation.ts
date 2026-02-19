import api from "@/lib/axios";
import { EvaluationResponse } from "@/types/evaluation";

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
