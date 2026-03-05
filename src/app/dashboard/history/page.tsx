"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getPredictionHistory } from "@/service/evaluation";
import {
  PrediccionRecord,
  RoboflowPrediction,
  ModelResult,
  MultiModelEvaluationResult,
} from "@/types/evaluation";
import html2pdf from "html2pdf.js";

const ZOOM_OPTIONS = [1, 2, 3] as const;

const DISEASE_NAMES: Record<string, string> = {
  Potato___Early_blight: "Tizón Temprano",
  Potato___Late_blight: "Tizón Tardío",
  Potato___healthy: "Saludable",
};

const MODEL_LABELS: Record<string, string> = {
  efficient: "EfficientNet",
  resnet: "ResNet",
  mobilevit: "MobileViT",
};

function diseaseName(cls: string) {
  return DISEASE_NAMES[cls] ?? cls;
}

function modelLabel(key: string) {
  return MODEL_LABELS[key] ?? key;
}

function classColor(cls: string) {
  if (cls.includes("healthy")) return "bg-green-600";
  if (cls.includes("Early")) return "bg-amber-500";
  return "bg-red-600";
}

function classBadge(cls: string) {
  if (cls.includes("healthy")) return "bg-green-100 text-green-800";
  if (cls.includes("Early")) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function boxColor(cls: string) {
  const c = cls.toLowerCase();
  if (c.includes("blight")) return "#dc2626";
  if (c.includes("leaf")) return "#7c3aed";
  return "#16a34a";
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type RenderBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
};

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<PrediccionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PrediccionRecord | null>(null);
  const [zoomLevel, setZoomLevel] = useState<(typeof ZOOM_OPTIONS)[number]>(1);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!pdfRef.current || !selected) {
      toast.error("No hay contenido para exportar");
      return;
    }

    try {
      const element = pdfRef.current;
      const opt = {
        margin: 10,
        filename: `prediccion_${selected.id}_${formatDate(
          selected.fecha ?? selected.created_at,
        )
          .replace(/\s/g, "_")
          .replace(/:/g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf().set(opt).from(element).save();
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al exportar el PDF");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getPredictionHistory();
        setPredictions(res.data ?? []);
      } catch {
        toast.error("No se pudo cargar el historial de predicciones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateImageSize = () => {
    const img = imageRef.current;
    if (!img) return;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setDisplaySize({ width: img.clientWidth, height: img.clientHeight });
  };

  useEffect(() => {
    const onResize = () => updateImageSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selected]);

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    c.scrollLeft = Math.max(0, (c.scrollWidth - c.clientWidth) / 2);
    c.scrollTop = Math.max(0, (c.scrollHeight - c.clientHeight) / 2);
  }, [zoomLevel, displaySize.width, displaySize.height, selected]);

  const renderBoxes: RenderBox[] = useMemo(() => {
    const preds = selected?.fase1_payload?.predictions;
    if (!preds?.length) return [];
    if (
      !naturalSize.width ||
      !naturalSize.height ||
      !displaySize.width ||
      !displaySize.height
    )
      return [];

    const sx = displaySize.width / naturalSize.width;
    const sy = displaySize.height / naturalSize.height;

    return preds.map((p: RoboflowPrediction) => ({
      left: (p.x - p.width / 2) * sx,
      top: (p.y - p.height / 2) * sy,
      width: p.width * sx,
      height: p.height * sy,
      label: p.class,
      confidence: p.confidence,
    }));
  }, [selected, naturalSize, displaySize]);

  const fase2 = selected?.fase2_payload as MultiModelEvaluationResult | null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelected(null);
              setZoomLevel(1);
              setNaturalSize({ width: 0, height: 0 });
              setDisplaySize({ width: 0, height: 0 });
            }}
            className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1="19"
                y1="12"
                x2="5"
                y2="12"
              />
              <polyline points="12,19 5,12 12,5" />
            </svg>
            Volver al historial
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line
                x1="12"
                y1="19"
                x2="12"
                y2="5"
              />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            Exportar a PDF
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Imagen con bounding boxes */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                Predicción #{selected.id}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Zoom</span>
                {ZOOM_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setZoomLevel(o)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                      zoomLevel === o
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    x{o}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="overflow-auto rounded-lg border border-slate-100 bg-slate-50"
              style={{ maxHeight: "70vh" }}
            >
              <div
                className="relative mx-auto"
                style={{
                  width: displaySize.width
                    ? `${displaySize.width * zoomLevel}px`
                    : undefined,
                  height: displaySize.height
                    ? `${displaySize.height * zoomLevel}px`
                    : undefined,
                }}
              >
                <div
                  className="absolute top-0 left-0 origin-top-left"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imageRef}
                      src={selected.imagen_url}
                      alt={`Predicción ${selected.id}`}
                      className="max-w-full h-auto rounded-lg"
                      onLoad={updateImageSize}
                      crossOrigin="anonymous"
                    />
                    {renderBoxes.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {renderBoxes.map((box, i) => {
                          const color = boxColor(box.label);
                          return (
                            <div
                              key={i}
                              className="absolute"
                              style={{
                                left: `${box.left}px`,
                                top: `${box.top}px`,
                                width: `${box.width}px`,
                                height: `${box.height}px`,
                                border: `2px solid ${color}`,
                              }}
                            >
                              <div
                                className="absolute -top-6 left-0 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap"
                                style={{
                                  backgroundColor: color,
                                  transform: `scale(${1 / zoomLevel})`,
                                  transformOrigin: "top left",
                                }}
                              >
                                {box.label} {(box.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              {formatDate(selected.fecha ?? selected.created_at)}
            </p>
          </div>

          {/* Panel de información */}
          <div className="w-full lg:w-96 space-y-4 shrink-0">
            {/* Fase 1 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Fase 1 — Detección
              </h3>
              {selected.fase1_resumen ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coincidencias</span>
                    <span
                      className={`font-bold ${selected.fase1_resumen.has_matches ? "text-red-600" : "text-green-600"}`}
                    >
                      {selected.fase1_resumen.has_matches ? "Sí" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Detecciones</span>
                    <span className="font-bold text-slate-800">
                      {selected.fase1_resumen.total_detecciones}
                    </span>
                  </div>
                  {selected.fase1_resumen.clases_detectadas.length > 0 && (
                    <div>
                      <span className="text-slate-500 text-xs">Clases:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selected.fase1_resumen.clases_detectadas.map((c) => (
                          <span
                            key={c}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.fase1_payload && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Modelo</span>
                      <span className="text-xs font-medium text-slate-700">
                        {selected.fase1_payload.model_id}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Sin datos</p>
              )}
            </div>

            {/* Fase 2 — Resumen */}
            {selected.fase2_resumen && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Fase 2 — Diagnóstico (mejor modelo)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${classBadge(selected.fase2_resumen.clase_predicha)}`}
                    >
                      {diseaseName(selected.fase2_resumen.clase_predicha)}
                    </span>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      {(selected.fase2_resumen.confianza * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${classColor(selected.fase2_resumen.clase_predicha)}`}
                      style={{
                        width: `${selected.fase2_resumen.confianza * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Modelo: {modelLabel(selected.fase2_resumen.modelo)}
                  </p>
                </div>
              </div>
            )}

            {/* Fase 2 — Comparativo completo */}
            {fase2 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Comparativa de Modelos
                </h3>

                {fase2.resumen_comparativo && (
                  <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-slate-400">Consenso</span>
                      <p className="font-bold">
                        {fase2.resumen_comparativo.consenso ? (
                          <span className="text-emerald-600">
                            Sí —{" "}
                            {diseaseName(
                              fase2.resumen_comparativo.clase_consenso ?? "",
                            )}
                          </span>
                        ) : (
                          <span className="text-amber-600">No</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Más confiado</span>
                      <p className="font-bold text-slate-800">
                        {modelLabel(
                          fase2.resumen_comparativo.modelo_mas_confiado,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {Object.entries(fase2.resultados).map(
                  ([key, r]: [string, ModelResult]) => {
                    const isBest = key === fase2.mejor_modelo_global;
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          isBest
                            ? "border-emerald-300 bg-emerald-50/60"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            {modelLabel(key)}
                            {isBest && (
                              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                Mejor
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-slate-600">
                            {(r.confianza * 100).toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mb-1.5">
                          {diseaseName(r.clase_predicha)}
                        </p>

                        <div className="space-y-1 mb-2">
                          {Object.entries(r.todas_predicciones)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cls, prob]) => (
                              <div
                                key={cls}
                                className="flex items-center gap-1.5"
                              >
                                <span className="text-[10px] text-slate-500 w-20 truncate">
                                  {diseaseName(cls)}
                                </span>
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${classColor(cls)}`}
                                    style={{ width: `${prob * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] tabular-nums font-medium text-slate-600 w-12 text-right">
                                  {prob < 0.0001
                                    ? "<0.01%"
                                    : `${(prob * 100).toFixed(2)}%`}
                                </span>
                              </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-100">
                          {(
                            [
                              ["Acc", r.metricas_entrenamiento.accuracy],
                              ["Prec", r.metricas_entrenamiento.precision],
                              ["Rec", r.metricas_entrenamiento.recall],
                              ["F1", r.metricas_entrenamiento.f1_score],
                            ] as const
                          ).map(([label, val]) => (
                            <div
                              key={label}
                              className="bg-slate-50 rounded px-1 py-0.5"
                            >
                              <p className="text-[9px] text-slate-400">
                                {label}
                              </p>
                              <p className="text-[11px] font-bold text-slate-700 tabular-nums">
                                {(val * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenido invisible para exportar a PDF */}
        <div
          ref={pdfRef}
          style={{ display: "none" }}
        >
          <div
            style={{
              padding: "20px",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              color: "#000",
            }}
          >
            {/* Encabezado */}
            <div
              style={{
                marginBottom: "20px",
                borderBottom: "2px solid #059669",
                paddingBottom: "10px",
              }}
            >
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 5px 0",
                  color: "#059669",
                }}
              >
                Reporte de Predicción
              </h1>
              <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>
                ID: #{selected.id} | Fecha:{" "}
                {formatDate(selected.fecha ?? selected.created_at)}
              </p>
            </div>

            {/* Imagen con información */}
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  color: "#1f2937",
                }}
              >
                Imagen Analizada
              </h2>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.imagen_url}
                  alt="Imagen"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "250px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Fase 1 */}
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                backgroundColor: "#f9fafb",
              }}
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  color: "#374151",
                }}
              >
                FASE 1 — DETECCIÓN (Roboflow)
              </h3>
              {selected.fase1_resumen ? (
                <div style={{ lineHeight: "1.6" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Coincidencias:</span>
                    <span>
                      {selected.fase1_resumen.has_matches
                        ? "Sí — Enfermedad detectada"
                        : "No — Papa saludable"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      Total de Detecciones:
                    </span>
                    <span>{selected.fase1_resumen.total_detecciones}</span>
                  </div>
                  {selected.fase1_resumen.clases_detectadas.length > 0 && (
                    <div style={{ marginBottom: "4px" }}>
                      <span style={{ fontWeight: "bold" }}>
                        Clases Detectadas:
                      </span>
                      <span>
                        {" "}
                        {selected.fase1_resumen.clases_detectadas
                          .map((c) => diseaseName(c))
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {selected.fase1_payload && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>Modelo:</span>
                      <span>{selected.fase1_payload.model_id}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: "#999" }}>Sin datos</p>
              )}
            </div>

            {/* Fase 2 */}
            {selected.fase2_resumen && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0 0 8px 0",
                    color: "#374151",
                  }}
                >
                  FASE 2 — DIAGNÓSTICO (Mejor Modelo)
                </h3>
                <div style={{ lineHeight: "1.6" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Predicción:</span>
                    <span>
                      {diseaseName(selected.fase2_resumen.clase_predicha)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>Confianza:</span>
                    <span>
                      {(selected.fase2_resumen.confianza * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontWeight: "bold" }}>Modelo:</span>
                    <span>{modelLabel(selected.fase2_resumen.modelo)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comparativa Completa */}
            {fase2 && (
              <div
                style={{
                  padding: "10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    margin: "0 0 8px 0",
                    color: "#374151",
                  }}
                >
                  COMPARATIVA DE MODELOS
                </h3>

                {fase2.resumen_comparativo && (
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                      }}
                    >
                      <p
                        style={{ margin: "0", fontSize: "10px", color: "#666" }}
                      >
                        Consenso
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                      >
                        {fase2.resumen_comparativo.consenso ? (
                          <>
                            Sí —{" "}
                            {diseaseName(
                              fase2.resumen_comparativo.clase_consenso ?? "",
                            )}
                          </>
                        ) : (
                          <>No hay consenso</>
                        )}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "8px",
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "3px",
                      }}
                    >
                      <p
                        style={{ margin: "0", fontSize: "10px", color: "#666" }}
                      >
                        Más Confiado
                      </p>
                      <p
                        style={{
                          margin: "0",
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                      >
                        {modelLabel(
                          fase2.resumen_comparativo.modelo_mas_confiado,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {Object.entries(fase2.resultados).map(
                  ([key, r]: [string, ModelResult]) => {
                    const isBest = key === fase2.mejor_modelo_global;
                    return (
                      <div
                        key={key}
                        style={{
                          marginBottom: "8px",
                          padding: "8px",
                          border: isBest
                            ? "2px solid #059669"
                            : "1px solid #ddd",
                          borderRadius: "3px",
                          backgroundColor: isBest ? "#f0fdf4" : "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{ fontWeight: "bold", fontSize: "11px" }}
                          >
                            {modelLabel(key)}{" "}
                            {isBest && <strong>[MEJOR]</strong>}
                          </span>
                          <span style={{ fontSize: "10px" }}>
                            {(r.confianza * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                          <p
                            style={{
                              margin: "0",
                              fontWeight: "bold",
                              fontSize: "11px",
                            }}
                          >
                            {diseaseName(r.clase_predicha)}
                          </p>
                        </div>

                        {/* Predicciones */}
                        <div style={{ marginBottom: "6px", fontSize: "9px" }}>
                          {Object.entries(r.todas_predicciones)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cls, prob]) => (
                              <div
                                key={cls}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: "2px",
                                }}
                              >
                                <span>{diseaseName(cls)}</span>
                                <span>
                                  {prob < 0.0001
                                    ? "<0.01%"
                                    : `${(prob * 100).toFixed(2)}%`}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Métricas */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            gap: "4px",
                            fontSize: "9px",
                            borderTop: "1px solid #ddd",
                            paddingTop: "4px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px 0", color: "#666" }}>
                              Acc
                            </p>
                            <p style={{ margin: "0", fontWeight: "bold" }}>
                              {(
                                r.metricas_entrenamiento.accuracy * 100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px 0", color: "#666" }}>
                              Prec
                            </p>
                            <p style={{ margin: "0", fontWeight: "bold" }}>
                              {(
                                r.metricas_entrenamiento.precision * 100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px 0", color: "#666" }}>
                              Rec
                            </p>
                            <p style={{ margin: "0", fontWeight: "bold" }}>
                              {(r.metricas_entrenamiento.recall * 100).toFixed(
                                1,
                              )}
                              %
                            </p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 2px 0", color: "#666" }}>
                              F1
                            </p>
                            <p style={{ margin: "0", fontWeight: "bold" }}>
                              {(
                                r.metricas_entrenamiento.f1_score * 100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Historial de Predicciones
        </h1>
        <p className="text-slate-500 mt-1">
          Todas las evaluaciones realizadas por tu usuario.
        </p>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">
            Aún no tienes predicciones registradas.
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Realiza una evaluación para verla aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {predictions.map((pred) => {
            const hasMatches = pred.fase1_resumen?.has_matches;
            const diagnosis =
              pred.fase2_resumen?.clase_predicha ?? "Sin clasificar";
            const confidence = pred.fase2_resumen?.confianza ?? 0;

            return (
              <div
                key={pred.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                onClick={() => setSelected(pred)}
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pred.imagen_url}
                    alt={`Predicción ${pred.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      #{pred.id}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    {hasMatches ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pred.fase1_resumen?.total_detecciones} detección
                        {(pred.fase1_resumen?.total_detecciones ?? 0) > 1
                          ? "es"
                          : ""}
                      </span>
                    ) : (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Sin detección
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-slate-400 mb-2">
                    {formatDate(pred.fecha ?? pred.created_at)}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${classBadge(diagnosis)}`}
                    >
                      {diseaseName(diagnosis)}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-slate-600">
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${classColor(diagnosis)}`}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>

                  <p className="mt-auto text-emerald-600 text-xs font-semibold flex items-center gap-1">
                    Ver detalle
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9,6 15,12 9,18" />
                    </svg>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
