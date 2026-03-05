"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { evaluarSurco, getPrediccionesBySurco } from "@/service/hierarchy";
import { Prediccion } from "@/types/hierarchy";

export default function PrediccionesPage() {
  const params = useParams<{
    moduloId: string;
    loteId: string;
    surcoId: string;
  }>();
  const moduloId = params.moduloId;
  const loteId = params.loteId;
  const surcoId = params.surcoId;

  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPredicciones = async () => {
    try {
      const response = await getPrediccionesBySurco(moduloId, loteId, surcoId);
      setPredicciones(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las predicciones",
      );
    }
  };

  useEffect(() => {
    loadPredicciones();
  }, [moduloId, loteId, surcoId]);

  const onEvaluate = async () => {
    if (!selectedImage) {
      setError("Selecciona una imagen primero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await evaluarSurco(moduloId, loteId, surcoId, selectedImage);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadPredicciones();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo evaluar la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Predicciones del surco {surcoId}
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
        <p className="text-gray-700 font-semibold">Nueva evaluación</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          disabled={!selectedImage || loading}
          onClick={onEvaluate}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
        >
          {loading ? "Evaluando..." : "Evaluar y guardar"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {predicciones.map((prediccion) => (
          <Link
            key={prediccion.id}
            href={`/dashboard/modulos/${moduloId}/lotes/${loteId}/surcos/${surcoId}/predicciones/${prediccion.id}`}
            className="block bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">
                Prediccion #{prediccion.id}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(prediccion.fecha).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Fase 2: {prediccion.fase2_resumen.clase_predicha} (
              {(prediccion.fase2_resumen.confianza * 100).toFixed(2)}%)
            </p>
            <p className="text-xs text-green-700 mt-2">Ver detalle</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
