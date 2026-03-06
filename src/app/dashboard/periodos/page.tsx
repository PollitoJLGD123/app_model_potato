"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPeriodos,
  createPeriodo,
  getPredictionsByPeriodo,
} from "@/service/evaluation";
import { Periodo } from "@/types/evaluation";

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
  });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const resp = await getPeriodos();
      setPeriodos(resp.data || []);
    } catch (err) {
      toast.error("No se pudieron cargar los periodos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      toast.error("Nombre y fechas son obligatorios");
      return;
    }
    try {
      setCreating(true);
      await createPeriodo(
        form.nombre,
        form.fecha_inicio,
        form.fecha_fin,
        form.descripcion || undefined,
      );
      toast.success("Periodo creado");
      setForm({ nombre: "", fecha_inicio: "", fecha_fin: "", descripcion: "" });
      await load();
    } catch (err) {
      toast.error("Error creando periodo");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Periodos</h1>
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) =>
                setForm({ ...form, fecha_inicio: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fin</label>
            <input
              type="date"
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
              className="mt-1 w-full border px-3 py-2 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {creating ? "Creando..." : "Crear periodo"}
        </button>
      </form>

      {loading ? (
        <p>Cargando periodos...</p>
      ) : periodos.length === 0 ? (
        <p>No hay periodos</p>
      ) : (
        <ul className="space-y-3">
          {periodos.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded-lg"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{p.nombre}</span>
                <span className="text-sm text-gray-500">
                  {p.fecha_inicio} – {p.fecha_fin}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
