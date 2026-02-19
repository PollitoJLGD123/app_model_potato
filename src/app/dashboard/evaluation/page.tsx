"use client";

import { useState, useRef } from "react";
import { evaluationImage } from "@/service/evaluation";
import { EvaluationResult } from "@/types/evaluation";

export default function EvaluationPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      setSelectedImage(file);
      setError("");
      setResult(null);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Por favor selecciona una imagen primero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await evaluationImage(selectedImage);
      setResult(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Error al evaluar la imagen. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getDiseaseName = (className: string): string => {
    const names: { [key: string]: string } = {
      "Potato___Early_blight": "Tizón Temprano",
      "Potato___Late_blight": "Tizón Tardío",
      "Potato___healthy": "Saludable",
    };
    return names[className] || className;
  };

  const getDiseaseColor = (className: string): string => {
    if (className.includes("healthy")) {
      return "green";
    } else if (className.includes("Early")) {
      return "yellow";
    } else {
      return "red";
    }
  };

  const getDiseaseIcon = (className: string) => {
    if (className.includes("healthy")) {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Evaluación de Imágenes
        </h1>
        <p className="text-gray-600">
          Sube una imagen de una hoja de papa para detectar enfermedades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Subida de imagen */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Seleccionar Imagen
          </h2>

          {/* Área de subida */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              preview
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-green-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-600">
                  {selectedImage?.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-gray-600 font-medium">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, JPEG hasta 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Botón de evaluación */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Evaluando...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Evaluar Imagen
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Panel derecho - Resultados */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Resultados de la Evaluación
          </h2>

          {result ? (
            <div className="space-y-6">
              {/* Resultado principal */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  result.clase_predicha.includes("healthy")
                    ? "bg-green-50 border-green-200"
                    : result.clase_predicha.includes("Early")
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`text-${
                      result.clase_predicha.includes("healthy")
                        ? "green"
                        : result.clase_predicha.includes("Early")
                        ? "yellow"
                        : "red"
                    }-600`}
                  >
                    {getDiseaseIcon(result.clase_predicha)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {getDiseaseName(result.clase_predicha)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Confianza:{" "}
                      <span className="font-semibold">
                        {(result.confianza * 100).toFixed(2)}%
                      </span>
                    </p>
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          result.clase_predicha.includes("healthy")
                            ? "bg-green-600"
                            : result.clase_predicha.includes("Early")
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{
                          width: `${result.confianza * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Todas las predicciones */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Todas las Predicciones:
                </h4>
                <div className="space-y-2">
                  {Object.entries(result.todas_predicciones)
                    .sort(([, a], [, b]) => b - a)
                    .map(([className, confidence]) => (
                      <div
                        key={className}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {getDiseaseName(className)}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                getDiseaseColor(className) === "green"
                                  ? "bg-green-600"
                                  : getDiseaseColor(className) === "yellow"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{
                                width: `${confidence * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                            {(confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Botón para nueva evaluación */}
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Nueva Evaluación
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Los resultados aparecerán aquí después de evaluar una imagen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
