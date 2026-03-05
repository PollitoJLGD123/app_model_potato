"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createSurco, getSurcosByLote } from "@/service/hierarchy";
import { Surco } from "@/types/hierarchy";

export default function SurcosPage() {
  const params = useParams<{ moduloId: string; loteId: string }>();
  const moduloId = params.moduloId;
  const loteId = params.loteId;

  const [surcos, setSurcos] = useState<Surco[]>([]);
  const [numero, setNumero] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const loadSurcos = async () => {
    try {
      const response = await getSurcosByLote(moduloId, loteId);
      setSurcos(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudieron cargar los surcos",
      );
    }
  };

  useEffect(() => {
    loadSurcos();
  }, [moduloId, loteId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(numero);
    if (!parsed || parsed < 1) {
      setError("El numero de surco debe ser mayor a 0");
      return;
    }

    try {
      await createSurco(moduloId, loteId, parsed, descripcion.trim());
      setNumero("");
      setDescripcion("");
      setError("");
      await loadSurcos();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo crear el surco");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Surcos del lote {loteId}
      </h1>

      <form
        onSubmit={onCreate}
        className="bg-white rounded-xl shadow-md p-6 grid gap-3 md:grid-cols-3"
      >
        <input
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Numero"
          type="number"
          min={1}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripcion"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold">
          Crear surco
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {surcos.map((surco) => (
          <Link
            key={surco.id}
            href={`/dashboard/modulos/${moduloId}/lotes/${loteId}/surcos/${surco.id}/predicciones`}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <h2 className="font-bold text-gray-800 text-lg">
              Surco {surco.numero}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {surco.descripcion || "Sin descripcion"}
            </p>
            <p className="text-xs text-green-700 mt-4">Ver predicciones</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
