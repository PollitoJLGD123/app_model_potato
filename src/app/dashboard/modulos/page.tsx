"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { createModulo, getModulos } from "@/service/hierarchy";
import { Modulo } from "@/types/hierarchy";

export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  const loadModulos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getModulos();
      setModulos(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "No se pudieron cargar los modulos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    loadModulos();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre del modulo es obligatorio");
      return;
    }

    try {
      await createModulo(nombre.trim(), descripcion.trim());
      setNombre("");
      setDescripcion("");
      await loadModulos();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Sesion no valida. Vuelve a iniciar sesion.");
        return;
      }
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "No se pudo crear el modulo",
      );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Modulos</h1>
        <p className="text-gray-600">Gestion de la jerarquia del cultivo</p>
      </div>

      <form
        onSubmit={onCreate}
        className="bg-white rounded-xl shadow-md p-6 grid gap-3 md:grid-cols-3"
      >
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del modulo"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripcion (opcional)"
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold"
        >
          Crear modulo
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-600">Cargando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modulos.map((modulo) => (
          <Link
            key={modulo.id}
            href={`/dashboard/modulos/${modulo.id}/lotes`}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <h2 className="font-bold text-gray-800 text-lg">{modulo.nombre}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {modulo.descripcion || "Sin descripcion"}
            </p>
            <p className="text-xs text-green-700 mt-4">Ver lotes</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
