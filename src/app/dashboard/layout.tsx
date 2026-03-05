"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Leaf,
  Map,
  Menu,
} from "@/components/ui-icons";
import {
  getLotesByModulo,
  getModulos,
  getSurcosByLote,
} from "@/service/hierarchy";
import { Lote, Modulo, Surco } from "@/types/hierarchy";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lotesDeModulo, setLotesDeModulo] = useState<Record<string, Lote[]>>(
    {},
  );
  const [surcosDeLote, setSurcosDeLote] = useState<Record<string, Surco[]>>({});
  const [expandedModulos, setExpandedModulos] = useState<
    Record<string, boolean>
  >({});
  const [expandedLotes, setExpandedLotes] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    // Verificar si hay token
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const loadModulos = async () => {
      if (isCheckingAuth || pathname === "/dashboard") {
        return;
      }
      try {
        const res = await getModulos();
        setModulos(res.data || []);
      } catch {
        setModulos([]);
      }
    };

    loadModulos();
  }, [isCheckingAuth, pathname]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 text-gray-600">
        Verificando sesión...
      </div>
    );
  }

  // /dashboard ya dibuja su propio header+sidebar unificado.
  if (pathname === "/dashboard") {
    return <>{children}</>;
  }

  const fetchLotes = async (moduloId: number) => {
    try {
      const res = await getLotesByModulo(moduloId.toString());
      setLotesDeModulo((prev) => ({ ...prev, [moduloId]: res.data || [] }));
    } catch {
      setLotesDeModulo((prev) => ({ ...prev, [moduloId]: [] }));
    }
  };

  const fetchSurcos = async (moduloId: number, loteId: number) => {
    try {
      const res = await getSurcosByLote(moduloId.toString(), loteId.toString());
      setSurcosDeLote((prev) => ({ ...prev, [loteId]: res.data || [] }));
    } catch {
      setSurcosDeLote((prev) => ({ ...prev, [loteId]: [] }));
    }
  };

  const toggleModulo = (id: number) => {
    setExpandedModulos((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!expandedModulos[id]) {
      fetchLotes(id);
    }
  };

  const toggleLote = (moduloId: number, loteId: number) => {
    setExpandedLotes((prev) => ({ ...prev, [loteId]: !prev[loteId] }));
    if (!expandedLotes[loteId]) {
      fetchSurcos(moduloId, loteId);
    }
  };

  const isActive = (path: string) =>
    pathname === path
      ? "bg-emerald-100 text-emerald-700"
      : "text-slate-700 hover:bg-slate-100";

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-emerald-200 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <button
              className="flex items-center space-x-2"
              onClick={() => router.push("/dashboard")}
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Leaf size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">
                Agro<span className="text-emerald-600">Vision</span>
              </span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)] relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all h-full ${isSidebarOpen ? "block absolute z-20 shadow-xl" : "hidden lg:block"} lg:relative sticky top-0`}
        >
          <div className="p-3 border-b border-slate-200 bg-white space-y-1">
            <button
              onClick={() => router.push("/dashboard")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard")}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard/evaluation")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/evaluation")}`}
            >
              Evaluación
            </button>
            <button
              onClick={() => router.push("/dashboard/evaluation-complete")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/evaluation-complete")}`}
            >
              Evaluación Completa
            </button>
            <button
              onClick={() => router.push("/dashboard/recommendations")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/dashboard/recommendations")}`}
            >
              🌿 Recomendaciones
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center">
              <Map
                size={16}
                className="mr-2 text-emerald-600"
              />
              Jerarquía Finca
            </h2>
            <div className="mt-3 max-h-[45vh] overflow-y-auto space-y-1">
              {modulos.map((modulo) => {
                const lotes = lotesDeModulo[modulo.id] || [];
                const isModuloExpanded = expandedModulos[modulo.id];

                return (
                  <div
                    key={modulo.id}
                    className="text-sm"
                  >
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="text-left truncate text-slate-700"
                      >
                        {modulo.nombre}
                      </button>
                      <button
                        onClick={() => toggleModulo(modulo.id)}
                        className="p-1 rounded hover:bg-slate-200"
                      >
                        {isModuloExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    </div>

                    {isModuloExpanded && (
                      <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-1 mt-1">
                        {lotes.length === 0 && (
                          <p className="text-xs text-slate-400 py-1 italic">
                            Sin lotes
                          </p>
                        )}
                        {lotes.map((lote) => {
                          const surcos = surcosDeLote[lote.id] || [];
                          const isLoteExpanded = expandedLotes[lote.id];

                          return (
                            <div key={lote.id}>
                              <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                                <button
                                  onClick={() => router.push("/dashboard")}
                                  className="text-left truncate text-slate-600 flex items-center"
                                >
                                  <Layers
                                    size={12}
                                    className="mr-2"
                                  />
                                  {lote.identificador}
                                </button>
                                <button
                                  onClick={() => toggleLote(modulo.id, lote.id)}
                                  className="p-1 rounded hover:bg-slate-200"
                                >
                                  {isLoteExpanded ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                </button>
                              </div>

                              {isLoteExpanded && (
                                <div className="ml-4 pl-3 border-l-2 border-slate-100 space-y-1 mt-1">
                                  {surcos.length === 0 && (
                                    <p className="text-xs text-slate-400 py-1 italic">
                                      Sin surcos
                                    </p>
                                  )}
                                  {surcos.map((surco) => (
                                    <button
                                      key={surco.id}
                                      onClick={() => router.push("/dashboard")}
                                      className="w-full text-left p-2 rounded-md hover:bg-slate-100 text-slate-500"
                                    >
                                      Surco {surco.numero}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
