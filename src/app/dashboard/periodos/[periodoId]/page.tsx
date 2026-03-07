"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPredictionsByPeriodo } from "@/service/evaluation";
import { PrediccionRecord } from "@/types/evaluation";

export default function PeriodoDetailPage({
  params,
}: {
  params: { periodoId: string };
}) {
  const { periodoId } = params;
  const router = useRouter();
  const [predicciones, setPredicciones] = useState<PrediccionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await getPredictionsByPeriodo(parseInt(periodoId, 10));
        setPredicciones(resp.data || []);
      } catch (err) {
        toast.error("No se pudieron obtener las predicciones");
      } finally {
        setLoading(false);
      }
    })();
  }, [periodoId]);

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 underline"
      >
        ← Volver
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Predicciones en periodo #{periodoId}
      </h1>
      {loading ? (
        <p>Cargando...</p>
      ) : predicciones.length === 0 ? (
        <p>No hay predicciones en este periodo.</p>
      ) : (
        <ul className="space-y-4">
          {predicciones.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded-lg"
            >
              <p>ID: {p.id}</p>
              <p>Surco: {p.surco_id}</p>
              <p>Fecha: {new Date(p.fecha).toLocaleString()}</p>
              <p>Diagnóstico: {p.fase2_resumen?.clase_predicha || "N/A"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
