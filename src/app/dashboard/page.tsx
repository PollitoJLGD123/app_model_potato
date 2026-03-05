"use client";

import React, { useState, useEffect } from "react";
import {
  Leaf,
  Map,
  Layers,
  ImageIcon,
  ArrowLeft,
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Upload,
  Activity,
  Menu,
  LogOut,
} from "@/components/ui-icons";
import { useRouter } from "next/navigation";
import {
  getModulos,
  getLotesByModulo,
  getSurcosByLote,
  getPrediccionesBySurco,
  evaluarSurco,
  createModulo,
  createLote,
  createSurco,
} from "@/service/hierarchy";
import { Modulo, Lote, Surco, Prediccion } from "@/types/hierarchy";

export default function Dashboard() {
  const router = useRouter();

  // --- STATE ---
  const [currentView, setCurrentView] = useState("modulos");

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [lotesDeModulo, setLotesDeModulo] = useState<Record<string, Lote[]>>(
    {},
  );
  const [surcosDeLote, setSurcosDeLote] = useState<Record<string, Surco[]>>({});
  const [prediccionesDeSurco, setPrediccionesDeSurco] = useState<
    Record<string, Prediccion[]>
  >({});

  const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [selectedSurco, setSelectedSurco] = useState<Surco | null>(null);
  const [selectedPrediccion, setSelectedPrediccion] =
    useState<Prediccion | null>(null);

  const [expandedModulos, setExpandedModulos] = useState<
    Record<string, boolean>
  >({});
  const [expandedLotes, setExpandedLotes] = useState<Record<string, boolean>>(
    {},
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // --- DATA FETCHING ---
  const fetchModulos = async () => {
    try {
      setLoading(true);
      const res = await getModulos();
      if (res.data) setModulos(res.data);
    } catch (error) {
      console.error("Error al obtener módulos", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLotes = async (moduloId: number) => {
    try {
      const res = await getLotesByModulo(moduloId.toString());
      if (res.data) {
        setLotesDeModulo((prev) => ({ ...prev, [moduloId]: res.data }));
      }
    } catch (error) {
      console.error("Error al obtener lotes", error);
    }
  };

  const fetchSurcos = async (moduloId: number, loteId: number) => {
    try {
      const res = await getSurcosByLote(moduloId.toString(), loteId.toString());
      if (res.data) {
        setSurcosDeLote((prev) => ({ ...prev, [loteId]: res.data }));
      }
    } catch (error) {
      console.error("Error al obtener surcos", error);
    }
  };

  const fetchPredicciones = async (
    moduloId: number,
    loteId: number,
    surcoId: number,
  ) => {
    try {
      const res = await getPrediccionesBySurco(
        moduloId.toString(),
        loteId.toString(),
        surcoId.toString(),
      );
      if (res.data) {
        setPrediccionesDeSurco((prev) => ({ ...prev, [surcoId]: res.data }));
      }
    } catch (error) {
      console.error("Error al obtener predicciones", error);
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  // --- NAVIGATION HELPERS ---
  const navigateTo = (view: string, data: any = {}) => {
    setCurrentView(view);
    if (data.modulo !== undefined) {
      setSelectedModulo(data.modulo);
      if (data.modulo) fetchLotes(data.modulo.id);
    }
    if (data.lote !== undefined) {
      setSelectedLote(data.lote);
      if (data.lote && (data.modulo || selectedModulo)) {
        fetchSurcos(data.modulo?.id || selectedModulo?.id, data.lote.id);
      }
    }
    if (data.surco !== undefined) {
      setSelectedSurco(data.surco);
      if (
        data.surco &&
        (data.lote || selectedLote) &&
        (data.modulo || selectedModulo)
      ) {
        fetchPredicciones(
          data.modulo?.id || selectedModulo?.id,
          data.lote?.id || selectedLote?.id,
          data.surco.id,
        );
      }
    }
    if (data.prediccion !== undefined) setSelectedPrediccion(data.prediccion);
  };

  const goBack = () => {
    switch (currentView) {
      case "lotes":
        navigateTo("modulos", {
          modulo: null,
          lote: null,
          surco: null,
          prediccion: null,
        });
        break;
      case "surcos":
        navigateTo("lotes", { lote: null, surco: null, prediccion: null });
        break;
      case "predicciones":
        navigateTo("surcos", { surco: null, prediccion: null });
        break;
      case "detalle":
        navigateTo("predicciones", { prediccion: null });
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha desconocida";
    const options: any = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      e.target.files.length === 0 ||
      !selectedSurco ||
      !selectedLote ||
      !selectedModulo
    )
      return;
    try {
      setLoading(true);
      const file = e.target.files[0];
      await evaluarSurco(
        selectedModulo.id.toString(),
        selectedLote.id.toString(),
        selectedSurco.id.toString(),
        file,
      );
      // Refresh predicciones
      await fetchPredicciones(
        selectedModulo.id,
        selectedLote.id,
        selectedSurco.id,
      );
    } catch (error) {
      console.error("Error evaluating image", error);
      alert("Error al subir e evaluar la imagen");
    } finally {
      setLoading(false);
    }
  };

  // Toggle de un ítem en el sidebar
  const toggleModulo = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedModulos((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!expandedModulos[id]) fetchLotes(id);
  };

  const toggleLote = (
    e: React.MouseEvent,
    moduloId: number,
    loteId: number,
  ) => {
    e.stopPropagation();
    setExpandedLotes((prev) => ({ ...prev, [loteId]: !prev[loteId] }));
    if (!expandedLotes[loteId]) fetchSurcos(moduloId, loteId);
  };

  // --- ACTIONS ---
  const handleCreateModulo = async () => {
    const name = prompt("Nombre del nuevo módulo:");
    if (name) {
      await createModulo(name, "Módulo creado desde Dashboard");
      fetchModulos();
    }
  };

  const handleCreateLote = async () => {
    if (!selectedModulo) return;
    const name = prompt("Identificador del nuevo lote:");
    if (name) {
      await createLote(
        selectedModulo.id.toString(),
        name,
        "Lote creado desde Dashboard",
      );
      fetchLotes(selectedModulo.id);
    }
  };

  const handleCreateSurco = async () => {
    if (!selectedModulo || !selectedLote) return;
    const numeroStr = prompt("Número del surco (ej. 1, 2, 3...):");
    if (numeroStr && !isNaN(Number(numeroStr))) {
      await createSurco(
        selectedModulo.id.toString(),
        selectedLote.id.toString(),
        Number(numeroStr),
        "Surco creado",
      );
      fetchSurcos(selectedModulo.id, selectedLote.id);
    }
  };

  // --- COMPONENTS ---
  const Breadcrumbs = () => (
    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6 bg-white p-3 rounded-lg shadow-sm border border-slate-100 overflow-x-auto whitespace-nowrap">
      <button
        onClick={() =>
          navigateTo("modulos", {
            modulo: null,
            lote: null,
            surco: null,
            prediccion: null,
          })
        }
        className="hover:text-emerald-600 transition-colors font-medium"
      >
        Inicio
      </button>

      {selectedModulo && (
        <>
          <ChevronRight
            size={16}
            className="shrink-0"
          />
          <button
            onClick={() =>
              navigateTo("lotes", { lote: null, surco: null, prediccion: null })
            }
            className={`transition-colors ${currentView === "lotes" ? "text-emerald-700 font-semibold" : "hover:text-emerald-600"}`}
          >
            {selectedModulo.nombre}
          </button>
        </>
      )}

      {selectedLote &&
        (currentView === "surcos" ||
          currentView === "predicciones" ||
          currentView === "detalle") && (
          <>
            <ChevronRight
              size={16}
              className="shrink-0"
            />
            <button
              onClick={() =>
                navigateTo("surcos", { surco: null, prediccion: null })
              }
              className={`transition-colors ${currentView === "surcos" ? "text-emerald-700 font-semibold" : "hover:text-emerald-600"}`}
            >
              {selectedLote.identificador}
            </button>
          </>
        )}

      {selectedSurco &&
        (currentView === "predicciones" || currentView === "detalle") && (
          <>
            <ChevronRight
              size={16}
              className="shrink-0"
            />
            <button
              onClick={() => navigateTo("predicciones", { prediccion: null })}
              className={`transition-colors ${currentView === "predicciones" ? "text-emerald-700 font-semibold" : "hover:text-emerald-600"}`}
            >
              Surco {selectedSurco.numero}
            </button>
          </>
        )}

      {selectedPrediccion && currentView === "detalle" && (
        <>
          <ChevronRight
            size={16}
            className="shrink-0"
          />
          <span className="text-emerald-700 font-semibold shrink-0">
            Análisis
          </span>
        </>
      )}
    </div>
  );

  const renderSidebar = () => {
    return (
      <aside
        className={`w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all h-full ${isSidebarOpen ? "block absolute z-20 shadow-xl" : "hidden lg:block"} lg:relative sticky top-0`}
      >
        <div className="p-3 border-b border-slate-200 bg-white space-y-1">
          <button
            onClick={() =>
              navigateTo("modulos", {
                modulo: null,
                lote: null,
                surco: null,
                prediccion: null,
              })
            }
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors bg-emerald-100 text-emerald-700"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/dashboard/evaluation")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            Evaluación
          </button>
          <button
            onClick={() => router.push("/dashboard/evaluation-complete")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            Evaluación Completa
          </button>
          <button
            onClick={() => router.push("/dashboard/recommendations")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            🌿 Recomendaciones
          </button>
          <button
            onClick={() => router.push("/dashboard/dataset")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            📊 Dataset y Modelos
          </button>
          <button
            onClick={() => router.push("/dashboard/history")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            🕘 Historial
          </button>
          <button
            onClick={() => router.push("/dashboard/diagnosis")}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100"
          >
            🩺 Diagnóstico del Cultivo
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center">
            <Map
              size={16}
              className="mr-2 text-emerald-600"
            />{" "}
            Jerarquía Finca
          </h2>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {modulos.map((modulo) => {
            const lotes = lotesDeModulo[modulo.id] || [];
            const isModuloExpanded = expandedModulos[modulo.id];
            const isModuloSelected = selectedModulo?.id === modulo.id;

            return (
              <div
                key={modulo.id}
                className="text-sm"
              >
                <div
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${isModuloSelected && currentView === "lotes" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-700"}`}
                  onClick={() =>
                    navigateTo("lotes", {
                      modulo,
                      lote: null,
                      surco: null,
                      prediccion: null,
                    })
                  }
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Map
                      size={16}
                      className={
                        isModuloSelected ? "text-emerald-600" : "text-slate-400"
                      }
                    />
                    <span className="truncate">{modulo.nombre}</span>
                  </div>
                  <button
                    onClick={(e) => toggleModulo(e, modulo.id)}
                    className="p-1 hover:bg-slate-200 rounded"
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
                      const isLoteSelected = selectedLote?.id === lote.id;

                      return (
                        <div key={lote.id}>
                          <div
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${isLoteSelected && currentView === "surcos" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                            onClick={() => {
                              navigateTo("surcos", {
                                modulo,
                                lote,
                                surco: null,
                                prediccion: null,
                              });
                              if (!expandedModulos[modulo.id])
                                toggleModulo(
                                  { stopPropagation: () => {} } as any,
                                  modulo.id,
                                );
                            }}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <Layers
                                size={14}
                                className={
                                  isLoteSelected
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }
                              />
                              <span className="truncate">
                                {lote.identificador}
                              </span>
                            </div>
                            <button
                              onClick={(e) => toggleLote(e, modulo.id, lote.id)}
                              className="p-1 hover:bg-slate-200 rounded"
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
                              {surcos.map((surco) => {
                                const isSurcoSelected =
                                  selectedSurco?.id === surco.id;
                                return (
                                  <div
                                    key={surco.id}
                                    className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${isSurcoSelected && (currentView === "predicciones" || currentView === "detalle") ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-500"}`}
                                    onClick={() =>
                                      navigateTo("predicciones", {
                                        modulo,
                                        lote,
                                        surco,
                                        prediccion: null,
                                      })
                                    }
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                                    Surco {surco.numero}
                                  </div>
                                );
                              })}
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
      </aside>
    );
  };

  // --- VIEWS ---
  const renderModulos = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Map className="mr-3 text-emerald-600" /> Vista General de Cultivos
        </h2>
        <button
          onClick={handleCreateModulo}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 text-sm font-medium"
        >
          + Nuevo Módulo
        </button>
      </div>

      {modulos.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500">
            No hay módulos disponibles en la base de datos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((modulo) => (
          <div
            key={modulo.id}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col h-full"
            onClick={() => {
              navigateTo("lotes", { modulo });
              setExpandedModulos((prev) => ({ ...prev, [modulo.id]: true }));
            }}
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Map size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {modulo.nombre}
            </h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
              {modulo.descripcion || "Sin descripción"}
            </p>
            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4 mt-auto">
              <span className="text-emerald-600 font-semibold flex items-center ml-auto">
                Ver Lotes{" "}
                <ChevronRight
                  size={16}
                  className="ml-1"
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLotes = () => {
    if (!selectedModulo) return null;
    const lotes = lotesDeModulo[selectedModulo.id] || [];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="p-2 mr-4 bg-white rounded-full text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Lotes en {selectedModulo.nombre}
              </h2>
              <p className="text-slate-500 text-sm">
                Selecciona un lote para ver sus surcos
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateLote}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 text-sm font-medium"
          >
            + Nuevo Lote
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lotes.map((lote) => (
            <div
              key={lote.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
              onClick={() => {
                navigateTo("surcos", { lote });
                setExpandedLotes((prev) => ({ ...prev, [lote.id]: true }));
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Layers size={20} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {lote.identificador}
              </h3>
              <p className="text-slate-500 text-sm mt-1">{lote.descripcion}</p>
              <p className="text-emerald-600 text-sm font-medium mt-4 flex items-center">
                Gestionar Surcos{" "}
                <ChevronRight
                  size={16}
                  className="ml-1"
                />
              </p>
            </div>
          ))}
          {lotes.length === 0 && (
            <p className="text-slate-500 col-span-full py-8 text-center bg-white rounded-xl border border-dashed">
              No hay lotes registrados en este módulo.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderSurcos = () => {
    if (!selectedLote) return null;
    const surcos = surcosDeLote[selectedLote.id] || [];
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="p-2 mr-4 bg-white rounded-full text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Surcos del {selectedLote.identificador}
              </h2>
              <p className="text-slate-500 text-sm">
                Administra las predicciones por surco
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateSurco}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 text-sm font-medium"
          >
            + Nuevo Surco
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surcos.map((surco) => (
            <div
              key={surco.id}
              className="bg-white flex items-center justify-between p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
              onClick={() => navigateTo("predicciones", { surco })}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <span className="font-bold text-lg">#</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Surco {surco.numero}
                  </h3>
                  <p className="text-xs text-slate-500">{surco.descripcion}</p>
                </div>
              </div>
              <div className="text-slate-400 group-hover:text-emerald-600 transition-colors">
                <Camera size={24} />
              </div>
            </div>
          ))}
          {surcos.length === 0 && (
            <p className="text-slate-500 col-span-full py-8 text-center bg-white rounded-xl border border-dashed">
              No hay surcos registrados en este lote.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPredicciones = () => {
    if (!selectedSurco) return null;
    const predicciones = prediccionesDeSurco[selectedSurco.id] || [];

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="p-2 mr-4 bg-white rounded-full text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Análisis: Surco {selectedSurco.numero}
              </h2>
              <p className="text-slate-500 text-sm">
                Registro de hojas analizadas
              </p>
            </div>
          </div>

          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm cursor-pointer">
            {loading ? (
              <span className="animate-pulse">Analizando...</span>
            ) : (
              <>
                <Upload
                  size={18}
                  className="mr-2"
                />
                Añadir Nueva Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {predicciones.map((pred) => {
            const hasMatches = pred.fase1_resumen?.has_matches;
            const patologia = pred.fase2_resumen?.clase_predicha || "Saludable";
            const isSano = patologia === "Saludable" && !hasMatches;

            return (
              <div
                key={pred.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                onClick={() => navigateTo("detalle", { prediccion: pred })}
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={"http://localhost:8000" + pred.imagen_url}
                    alt="Hoja analizada"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {hasMatches ? (
                      <span className="bg-red-500 text-white p-1.5 rounded-full shadow-md flex">
                        <AlertTriangle size={16} />
                      </span>
                    ) : (
                      <span className="bg-green-500 text-white p-1.5 rounded-full shadow-md flex">
                        <CheckCircle size={16} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center text-xs text-slate-500 mb-2">
                    <Activity
                      size={14}
                      className="mr-1"
                    />{" "}
                    {formatDate(pred.fecha || pred.created_at || "")}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">
                    {patologia}
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Confianza:{" "}
                    {((pred.fase2_resumen?.confianza ?? 0) * 100).toFixed(1)}%
                  </p>

                  <div className="mt-auto text-emerald-600 text-sm font-semibold flex items-center">
                    Ver Detalles{" "}
                    <ChevronRight
                      size={16}
                      className="ml-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {predicciones.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
              <ImageIcon
                size={48}
                className="mx-auto text-slate-300 mb-4"
              />
              <p className="text-slate-500 text-lg">
                No hay imágenes analizadas en este surco.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Sube una foto para comenzar las predicciones.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDetallePrediccion = () => {
    const pred = selectedPrediccion;
    if (!pred) return null;

    const hasMatches = pred.fase1_resumen?.has_matches;
    const patologia = pred.fase2_resumen?.clase_predicha || "Ninguna";
    const confianza = (pred.fase2_resumen?.confianza ?? 0) * 100;
    const isSano =
      !hasMatches || patologia === "Saludable" || patologia === "Ninguna";
    const imageUrl = "http://localhost:8000" + pred.imagen_url;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={goBack}
            className="p-2 mr-4 bg-white rounded-full text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Detalle de Análisis IA
            </h2>
            <p className="text-slate-500 text-sm">
              Captura del {formatDate(pred.fecha || pred.created_at || "")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Imagen */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="relative rounded-xl overflow-hidden aspect-square lg:aspect-auto lg:h-125 bg-slate-100">
              <img
                src={imageUrl}
                alt="Detalle de hoja"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Columna Derecha: Datos */}
          <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-2 text-xs">
                  1
                </span>
                Fase 1: Clasificación de Detecciones
              </h3>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Detecciones encontradas:{" "}
                    {pred.fase1_resumen?.total_detecciones || 0}
                  </p>
                  <p className="text-sm text-slate-500 mb-2">
                    Clases:{" "}
                    {pred.fase1_resumen?.clases_detectadas?.join(", ") ||
                      "Ninguna"}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${
                    isSano
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isSano ? (
                    <CheckCircle
                      size={16}
                      className="mr-1"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="mr-1"
                    />
                  )}
                  {hasMatches ? "Enferma" : "Sana"}
                </div>
              </div>
            </div>

            {hasMatches && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mr-2 text-xs">
                    2
                  </span>
                  Fase 2: Diagnóstico
                </h3>

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Diagnóstico Principal
                    </p>
                    <h4
                      className={`text-2xl font-bold ${isSano ? "text-green-600" : "text-red-600"}`}
                    >
                      {patologia}
                    </h4>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">
                        Confianza de IA
                      </span>
                      <span className="font-bold text-emerald-600">
                        {confianza.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${isSano ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${confianza}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-4">
              <button
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                  isSano
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
                disabled={isSano}
              >
                <Leaf
                  size={20}
                  className="mr-2"
                />
                {isSano
                  ? "No requiere tratamiento"
                  : "Ver Guía de Recomendación"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-emerald-200 flex flex-col">
      {/* Navbar Minimalista */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() =>
                navigateTo("modulos", {
                  modulo: null,
                  lote: null,
                  surco: null,
                  prediccion: null,
                })
              }
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Leaf size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">
                Agro<span className="text-emerald-600">Vision</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">
              Finca San José
            </span>
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
              SJ
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal (Flex row) */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)] relative">
        {/* Overlay móvil para sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {renderSidebar()}

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs />

            {currentView === "modulos" && renderModulos()}
            {currentView === "lotes" && renderLotes()}
            {currentView === "surcos" && renderSurcos()}
            {currentView === "predicciones" && renderPredicciones()}
            {currentView === "detalle" && renderDetallePrediccion()}
          </div>
        </main>
      </div>
    </div>
  );
}
