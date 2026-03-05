"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function LoteDetailPage() {
  const params = useParams<{ moduloId: string; loteId: string }>();

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Lote {params.loteId}
        </h1>
        <p className="text-gray-600 mt-2">
          Selecciona el listado de surcos para continuar.
        </p>
        <Link
          href={`/dashboard/modulos/${params.moduloId}/lotes/${params.loteId}/surcos`}
          className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Ver surcos
        </Link>
      </div>
    </div>
  );
}
