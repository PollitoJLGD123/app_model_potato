"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getModulo } from "@/service/hierarchy";
import { Modulo } from "@/types/hierarchy";

export default function ModuloDetailPage() {
  const params = useParams<{ moduloId: string }>();
  const moduloId = params.moduloId;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getModulo(moduloId);
        setModulo(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "No se pudo cargar el modulo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduloId]);

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {modulo && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800">{modulo.nombre}</h1>
          <p className="text-gray-600 mt-2">
            {modulo.descripcion || "Sin descripcion"}
          </p>
          <Link
            href={`/dashboard/modulos/${moduloId}/lotes`}
            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Ver lotes
          </Link>
        </div>
      )}
    </div>
  );
}
