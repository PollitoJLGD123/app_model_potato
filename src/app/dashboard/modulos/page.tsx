"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getModulos } from "@/service/hierarchy";
import { Modulo } from "@/types/hierarchy";
import { toast } from "sonner";
import { Layers, ChevronRight } from "@/components/ui-icons";

export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getModulos();
        setModulos(res.data ?? []);
      } catch {
        toast.error("No se pudieron cargar los módulos");
        setModulos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Módulos
        </h1>
        <p className="text-slate-500 mt-1">
          Selecciona un módulo para ver sus lotes y surcos.
        </p>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Layers className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">No hay módulos registrados.</p>
          <p className="text-slate-400 text-sm mt-1">
            Crea un módulo desde el dashboard principal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modulos.map((modulo) => (
            <Link
              key={modulo.id}
              href={`/dashboard/modulos/${modulo.id}/lotes`}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Modulo: {modulo.nombre}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {modulo.descripcion || "Sin descripción"}
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
