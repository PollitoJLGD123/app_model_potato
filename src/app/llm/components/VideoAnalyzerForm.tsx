"use client";

import { useState } from "react";
import { toast } from "sonner";
import VideoTimeline from "./VideoTimeline";
import VideoSelector from "./VideoSelector";
import ModelSelector from "./ModelSelector";
import type { AnalysisResult } from "../types/analysis";

export default function VideoAnalyzerForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [videoForTimeline, setVideoForTimeline] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleValidationError = (message: string | null) => {
    if (message) {
      setError(message);
    } else {
      setError((prev) => (prev === "Solo se permiten archivos .mp4 o .mov" ? null : prev));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setAnalysisResult(null);
    setVideoForTimeline(null);

    if (!selectedFile) {
      setError("Debes seleccionar un archivo de video");
      return;
    }

    if (!email.trim()) {
      setError("El correo electrónico es requerido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("El correo electrónico no es válido");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("email", email.trim());
      if (phone.trim()) {
        formData.append("phone", phone.trim());
      }
      if (selectedModel) {
        formData.append("model", selectedModel);
      }

      const res = await fetch("/api/analyze-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Error al analizar el video");
      }

      setSuccess(true);
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        setVideoForTimeline(selectedFile);
      }
      setSelectedFile(null);
      setEmail("");
      setPhone("");
      toast.success("Análisis completado. Revisa tu correo para el PDF.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatSegundo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(400px,480px)] gap-8 items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 shrink-0"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Análisis de video con IA
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Sube un video de hojas de papa para detectar Tizón temprano o tardío.
            El reporte se enviará por correo y opcionalmente por WhatsApp.
          </p>
        </div>

        <VideoSelector
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onValidationError={handleValidationError}
          disabled={loading}
          error={error === "Solo se permiten archivos .mp4 o .mov" ? error : null}
        />

        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          disabled={loading}
        />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Teléfono (WhatsApp, opcional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+51987654321"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Incluye código de país (ej. +51 para Perú)
          </p>
        </div>

        {error && error !== "Solo se permiten archivos .mp4 o .mov" && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            Análisis completado. Revisa tu correo para el PDF.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFile || !email.trim()}
          className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analizando video... Esto puede tomar varios minutos
            </>
          ) : (
            "Analizar y enviar reporte"
          )}
        </button>

        {loading && (
          <p className="text-center text-sm text-slate-500">
            El proceso incluye subida del video, análisis con Gemini y generación
            del PDF. Por favor espera.
          </p>
        )}
      </form>

      {success && analysisResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 lg:sticky lg:top-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <h3 className="text-lg font-bold text-slate-800">
            Resultado del análisis
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <p className="text-2xl font-bold text-slate-800">
                {analysisResult.analisis_general.total_hojas}
              </p>
              <p className="text-xs text-slate-500">Total hojas</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-center">
              <p className="text-2xl font-bold text-green-700">
                {analysisResult.analisis_general.sanas}
              </p>
              <p className="text-xs text-slate-500">Sanas</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {analysisResult.analisis_general.enfermas}
              </p>
              <p className="text-xs text-slate-500">Enfermas</p>
            </div>
          </div>

          {analysisResult.segmentos_analizados.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Segmentos analizados
              </p>
              <div className="space-y-2">
                {analysisResult.segmentos_analizados.map((seg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                  >
                    <span className="font-mono text-slate-600">
                      {formatSegundo(seg.tiempo_inicio)} – {formatSegundo(seg.tiempo_fin)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        seg.enfermedad_detectada === "ninguna"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {seg.enfermedad_detectada}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {(seg.confianza_porcentaje * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videoForTimeline &&
            analysisResult.timeline_anotaciones &&
            analysisResult.timeline_anotaciones.length > 0 && (
              <VideoTimeline
                videoFile={videoForTimeline}
                timelineAnotaciones={analysisResult.timeline_anotaciones}
              />
            )}
        </div>
      )}
    </div>
  );
}
