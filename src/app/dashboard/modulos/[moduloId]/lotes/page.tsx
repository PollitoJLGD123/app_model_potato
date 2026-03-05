"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createLote, getLotesByModulo } from "@/service/hierarchy";
import { Lote } from "@/types/hierarchy";

export default function LotesPage() {
  const params = useParams<{ moduloId: string }>();
  const moduloId = params.moduloId;

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [identificador, setIdentificador] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const loadLotes = async () => {
    try {
      const response = await getLotesByModulo(moduloId);
      setLotes(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudieron cargar los lotes",
      );
    }
  };

  useEffect(() => {
    loadLotes();
  }, [moduloId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim()) {
      setError("El identificador del lote es obligatorio");
      return;
    }

    try {
      await createLote(moduloId, identificador.trim(), descripcion.trim());
      setIdentificador("");
      setDescripcion("");
      setError("");
      await loadLotes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo crear el lote");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Lotes del modulo {moduloId}
      </h1>

      <form
        onSubmit={onCreate}
        className="bg-white rounded-xl shadow-md p-6 grid gap-3 md:grid-cols-3"
      >
        <input
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          placeholder="Identificador"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripcion"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold">
          Crear lote
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {lotes.map((lote) => (
          <Link
            key={lote.id}
            href={`/dashboard/modulos/${moduloId}/lotes/${lote.id}/surcos`}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <h2 className="font-bold text-gray-800 text-lg">
              Lote {lote.identificador}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {lote.descripcion || "Sin descripcion"}
            </p>
            <p className="text-xs text-green-700 mt-4">Ver surcos</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
