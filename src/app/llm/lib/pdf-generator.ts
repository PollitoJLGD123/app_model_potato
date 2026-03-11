/**
 * Generación de PDF del reporte de análisis con jspdf y jspdf-autotable.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnalysisResult } from "../types/analysis";

/**
 * Genera un Buffer con el PDF del reporte de análisis.
 */
export async function generateReportPdf(data: AnalysisResult): Promise<Buffer> {
  const doc = new jsPDF();

  let y = 20;

  // Título
  doc.setFontSize(22);
  doc.setTextColor(5, 46, 22); // emerald-900
  doc.text("Reporte de Análisis de Enfermedades en Papa", 14, y);
  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES", {
      dateStyle: "long",
      timeStyle: "short",
    })}`,
    14,
    y
  );
  y += 20;

  // Sección: Análisis general
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Resumen del análisis", 14, y);
  y += 10;

  const { analisis_general } = data;
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Total de hojas analizadas: ${analisis_general.total_hojas}`, 14, y);
  y += 7;
  doc.text(`Hojas sanas: ${analisis_general.sanas}`, 14, y);
  y += 7;
  doc.text(`Hojas enfermas: ${analisis_general.enfermas}`, 14, y);
  y += 15;

  // Tabla: Segmentos analizados
  if (data.segmentos_analizados.length > 0) {
    doc.setFontSize(14);
    doc.text("Segmentos analizados", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [
        ["Inicio (s)", "Fin (s)", "Confianza %", "Enfermedad detectada"],
      ],
      body: data.segmentos_analizados.map((s) => [
        String(s.tiempo_inicio),
        String(s.tiempo_fin),
        `${s.confianza_porcentaje}%`,
        s.enfermedad_detectada,
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14 },
    });

    const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY?: number } };
    y = docWithTable.lastAutoTable?.finalY ?? y;
    y += 15;
  }

  // Tabla: Timeline de anotaciones
  if (data.timeline_anotaciones.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text("Timeline de anotaciones", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Segundo", "Juicio experto", "Recomendación"]],
      body: data.timeline_anotaciones.map((t) => [
        String(t.segundo),
        t.juicio_experto,
        t.recomendacion,
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      margin: { left: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 90 },
      },
    });
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
