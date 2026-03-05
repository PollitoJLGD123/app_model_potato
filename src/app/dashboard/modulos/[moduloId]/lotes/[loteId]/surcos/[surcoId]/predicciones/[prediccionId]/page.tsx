"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getPrediccionById } from "@/service/hierarchy";
import { Prediccion } from "@/types/hierarchy";

export default function PrediccionDetailPage() {
  const params = useParams<{
    moduloId: string;
    loteId: string;
    surcoId: string;
    prediccionId: string;
  }>();

  const [prediccion, setPrediccion] = useState<Prediccion | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getPrediccionById(
          params.moduloId,
          params.loteId,
          params.surcoId,
          params.prediccionId,
        );
        setPrediccion(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "No se pudo cargar el detalle",
        );
      }
    };
    load();
  }, [params.moduloId, params.loteId, params.surcoId, params.prediccionId]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Detalle de predicción
      </h1>
      {error && <p className="text-red-600">{error}</p>}

      {prediccion && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Imagen</p>
            {prediccion.imagen_url.startsWith("http") ? (
              <img
                src={prediccion.imagen_url}
                alt="Imagen evaluada"
                className="mt-3 max-h-96 rounded-lg border border-gray-200"
              />
            ) : (
              <p className="mt-2 text-gray-700">{prediccion.imagen_url}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Fase 1</h2>
              <p className="text-sm text-gray-700">
                Coincidencias:{" "}
                {prediccion.fase1_resumen.has_matches ? "Si" : "No"}
              </p>
              <p className="text-sm text-gray-700">
                Total detecciones: {prediccion.fase1_resumen.total_detecciones}
              </p>
              <p className="text-sm text-gray-700">
                Clases:{" "}
                {prediccion.fase1_resumen.clases_detectadas.join(", ") ||
                  "Ninguna"}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Fase 2</h2>
              <p className="text-sm text-gray-700">
                Clase: {prediccion.fase2_resumen.clase_predicha}
              </p>
              <p className="text-sm text-gray-700">
                Confianza:{" "}
                {(prediccion.fase2_resumen.confianza * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              disabled
              className="w-full bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg cursor-not-allowed"
            >
              Ver Recomendacion (Proximamente)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
