"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { evaluationImage, evaluationRoboflow } from "@/service/evaluation";
import {
  LocalEvaluationResult,
  RoboflowEvaluationResult,
  RoboflowPrediction,
} from "@/types/evaluation";

type LoadingStep = "idle" | "step1" | "step2";

type RenderBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
};

export default function EvaluationCompletePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [roboflowResult, setRoboflowResult] =
    useState<RoboflowEvaluationResult | null>(null);
  const [classificationResult, setClassificationResult] =
    useState<LocalEvaluationResult | null>(null);
  const [roboflowMessage, setRoboflowMessage] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("idle");
  const [error, setError] = useState<string>("");

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen valido");
      return;
    }

    setSelectedImage(file);
    setError("");
    setRoboflowResult(null);
    setClassificationResult(null);
    setRoboflowMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateImageSize = () => {
    const img = imageRef.current;
    if (!img) {
      return;
    }
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setDisplaySize({ width: img.clientWidth, height: img.clientHeight });
  };

  useEffect(() => {
    const onResize = () => updateImageSize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [preview]);

  const getBoxColor = (className: string): string => {
    const normalized = className.toLowerCase();
    if (normalized.includes("blight")) {
      return "#dc2626";
    }
    if (normalized.includes("leaf")) {
      return "#7c3aed";
    }
    return "#16a34a";
  };

  const renderBoxes: RenderBox[] = useMemo(() => {
    if (!roboflowResult || !roboflowResult.predictions.length) {
      return [];
    }

    if (
      !naturalSize.width ||
      !naturalSize.height ||
      !displaySize.width ||
      !displaySize.height
    ) {
      return [];
    }

    const scaleX = displaySize.width / naturalSize.width;
    const scaleY = displaySize.height / naturalSize.height;

    return roboflowResult.predictions.map((prediction: RoboflowPrediction) => ({
      left: (prediction.x - prediction.width / 2) * scaleX,
      top: (prediction.y - prediction.height / 2) * scaleY,
      width: prediction.width * scaleX,
      height: prediction.height * scaleY,
      label: prediction.class,
      confidence: prediction.confidence,
    }));
  }, [roboflowResult, naturalSize, displaySize]);

  const getDiseaseName = (className: string): string => {
    const names: { [key: string]: string } = {
      Potato___Early_blight: "Tizon Temprano",
      Potato___Late_blight: "Tizon Tardio",
      Potato___healthy: "Saludable",
    };
    return names[className] || className;
  };

  const getClassificationColor = (className: string): string => {
    if (className.includes("healthy")) {
      return "bg-green-600";
    }
    if (className.includes("Early")) {
      return "bg-yellow-500";
    }
    return "bg-red-600";
  };

  const getErrorMessage = (err: any): string => {
    const status = err?.response?.status;
    if (status === 401) return "Sesion expirada. Inicia sesion nuevamente.";
    if (status === 413) return "La imagen supera el tamano maximo permitido.";
    if (status === 504)
      return "Roboflow no respondio a tiempo. Intenta otra vez.";
    if (status === 502)
      return "Error del servicio de deteccion. Intenta mas tarde.";
    return (
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "Error al evaluar la imagen. Intenta de nuevo."
    );
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Por favor selecciona una imagen primero");
      return;
    }

    setError("");
    setRoboflowResult(null);
    setClassificationResult(null);
    setRoboflowMessage("");

    try {
      setLoadingStep("step1");
      const detectionResponse = await evaluationRoboflow(selectedImage);
      setRoboflowResult(detectionResponse.data);
      setRoboflowMessage(detectionResponse.message || "Deteccion completada");

      setLoadingStep("step2");
      const classificationResponse = await evaluationImage(selectedImage);
      setClassificationResult(classificationResponse.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingStep("idle");
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreview(null);
    setRoboflowResult(null);
    setClassificationResult(null);
    setRoboflowMessage("");
    setError("");
    setNaturalSize({ width: 0, height: 0 });
    setDisplaySize({ width: 0, height: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const stepMessage =
    loadingStep === "step1"
      ? "Paso 1/2: detectando zonas con Roboflow..."
      : loadingStep === "step2"
        ? "Paso 2/2: clasificando estado de la hoja..."
        : "";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Evaluacion Completa
        </h1>
        <p className="text-gray-600">
          Paso 1: deteccion con Roboflow y cajas. Paso 2: clasificacion de
          enfermedad o estado saludable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Seleccionar Imagen
          </h2>

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
                <p className="text-sm text-gray-600">{selectedImage?.name}</p>
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
                  <p className="text-gray-700 font-medium">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, JPEG o WEBP hasta 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || loadingStep !== "idle"}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStep === "idle"
                ? "Iniciar Evaluacion de 2 Pasos"
                : stepMessage}
            </button>

            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Resultado de Evaluacion Completa
          </h2>

          {preview ? (
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="relative inline-block mx-auto">
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Imagen analizada"
                  className="max-h-105 w-auto rounded-lg"
                  onLoad={updateImageSize}
                />

                {renderBoxes.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {renderBoxes.map((box, index) => {
                      const color = getBoxColor(box.label);
                      return (
                        <div
                          key={`${box.label}-${index}`}
                          className="absolute"
                          style={{
                            left: `${box.left}px`,
                            top: `${box.top}px`,
                            width: `${box.width}px`,
                            height: `${box.height}px`,
                            border: `2px solid ${color}`,
                          }}
                        >
                          <div
                            className="absolute -top-6 left-0 text-white text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: color }}
                          >
                            {box.label} {(box.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 border border-gray-200 rounded-lg">
              Sube una imagen para comenzar
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 rounded-lg border bg-slate-50 border-slate-200">
              <p className="text-sm font-semibold text-slate-700">
                Paso 1: Deteccion Roboflow
              </p>
              {roboflowResult ? (
                <>
                  <p className="text-sm text-slate-600 mt-1">
                    Modelo: {roboflowResult.model_id}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Detecciones: {roboflowResult.predictions.length}
                  </p>
                  <p className="text-sm mt-1 text-slate-700">
                    {roboflowMessage}
                  </p>
                  {!roboflowResult.has_matches && (
                    <p className="text-sm mt-2 text-blue-700">
                      No hubo coincidencias en la deteccion. Se completo
                      igualmente el paso 2.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Pendiente</p>
              )}
            </div>

            <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200">
              <p className="text-sm font-semibold text-emerald-700">
                Paso 2: Clasificacion de Enfermedad
              </p>
              {classificationResult ? (
                <>
                  <p className="text-sm text-emerald-700 mt-1 font-semibold">
                    {getDiseaseName(classificationResult.clase_predicha)}
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Confianza:{" "}
                    {(classificationResult.confianza * 100).toFixed(2)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${getClassificationColor(classificationResult.clase_predicha)}`}
                      style={{
                        width: `${classificationResult.confianza * 100}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 mt-1">Pendiente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
