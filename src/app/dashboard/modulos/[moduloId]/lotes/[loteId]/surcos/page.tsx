"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createSurco,
  getModulo,
  getLotesByModulo,
  getSurcosByLote,
} from "@/service/hierarchy";
import { Modulo, Lote, Surco } from "@/types/hierarchy";
import { toast } from "sonner";
import { ArrowLeft, Rows3, ChevronRight, Plus, X } from "@/components/ui-icons";

export default function SurcosPage() {
  const params = useParams();
  const router = useRouter();
  const moduloId = params.moduloId as string;
  const loteId = params.loteId as string;
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [lote, setLote] = useState<Lote | null>(null);
  const [surcos, setSurcos] = useState<Surco[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [numero, setNumero] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!moduloId || !loteId) return;
    try {
      const [modRes, lotesRes, surcosRes] = await Promise.all([
        getModulo(moduloId),
        getLotesByModulo(moduloId),
        getSurcosByLote(moduloId, loteId),
      ]);
      setModulo(modRes.data ?? null);
      const lotes = lotesRes.data ?? [];
      setLote(lotes.find((l) => l.id === Number(loteId)) ?? lotes[0] ?? null);
      setSurcos(surcosRes.data ?? []);
    } catch {
      toast.error("No se pudieron cargar los datos");
      setModulo(null);
      setLote(null);
      setSurcos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [moduloId, loteId]);

  const handleCreateSurco = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(numero, 10);
    if (isNaN(num) || num < 1) {
      toast.error("El número debe ser un entero positivo");
      return;
    }
    setSubmitting(true);
    try {
      await createSurco(moduloId, loteId, num, descripcion.trim());
      toast.success("Surco creado correctamente");
      setModalOpen(false);
      setNumero("");
      setDescripcion("");
      await loadData();
    } catch {
      toast.error("Error al crear el surco");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!modulo || !lote) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No se encontró el recurso.</p>
        <button
          onClick={() => router.push("/dashboard/modulos")}
          className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Volver a módulos
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard/modulos/${moduloId}/lotes`)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Surcos — {lote.identificador}
            </h1>
            <p className="text-slate-500 mt-1">
              {modulo.nombre} → {lote.identificador}
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shrink-0"
        >
          <Plus size={18} />
          Nuevo surco
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Crear surco
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSurco} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número *
                </label>
                <input
                  type="number"
                  min={1}
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej: 1, 2, 3..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {surcos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Rows3 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">No hay surcos en este lote.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {surcos.map((surco) => (
            <Link
              key={surco.id}
              href={`/dashboard/modulos/${moduloId}/lotes/${loteId}/surcos/${surco.id}/predicciones`}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Rows3 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Surco {surco.numero}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {surco.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
