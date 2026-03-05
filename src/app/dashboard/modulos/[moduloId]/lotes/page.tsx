"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getModulo,
  getLotesByModulo,
} from "@/service/hierarchy";
import { Modulo, Lote } from "@/types/hierarchy";
import { toast } from "sonner";
import { ArrowLeft, Map, ChevronRight } from "@/components/ui-icons";

export default function LotesPage() {
  const params = useParams();
  const router = useRouter();
  const moduloId = params.moduloId as string;
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduloId) return;
    const load = async () => {
      try {
        const [modRes, lotesRes] = await Promise.all([
          getModulo(moduloId),
          getLotesByModulo(moduloId),
        ]);
        setModulo(modRes.data ?? null);
        setLotes(lotesRes.data ?? []);
      } catch {
        toast.error("No se pudieron cargar los datos");
        setModulo(null);
        setLotes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [moduloId]);

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

  if (!modulo) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Módulo no encontrado.</p>
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/modulos")}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {modulo.nombre}
          </h1>
          <p className="text-slate-500 mt-1">Lotes del módulo</p>
        </div>
      </div>

      {lotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Map className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">No hay lotes en este módulo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lotes.map((lote) => (
            <Link
              key={lote.id}
              href={`/dashboard/modulos/${moduloId}/lotes/${lote.id}/surcos`}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Map size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {lote.identificador}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {lote.descripcion || "Sin descripción"}
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
