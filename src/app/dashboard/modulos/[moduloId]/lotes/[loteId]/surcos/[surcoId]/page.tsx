"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function SurcoDetailPage() {
  const params = useParams<{
    moduloId: string;
    loteId: string;
    surcoId: string;
  }>();

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Surco {params.surcoId}
        </h1>
        <p className="text-gray-600 mt-2">
          Aqui puedes gestionar las predicciones del surco.
        </p>
        <Link
          href={`/dashboard/modulos/${params.moduloId}/lotes/${params.loteId}/surcos/${params.surcoId}/predicciones`}
          className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Ver predicciones
        </Link>
      </div>
    </div>
  );
}
