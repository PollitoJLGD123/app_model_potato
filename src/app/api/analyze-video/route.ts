/**
 * API Route: POST /api/analyze-video
 *
 * Recibe FormData con:
 * - video: archivo de video (.mp4 o .mov)
 * - email: correo del usuario para enviar el PDF
 *
 * Flujo: guardar temporalmente → subir a Gemini → polling hasta ACTIVE →
 * analizar con gemini-1.5-pro → generar PDF → enviar por webhook (igual que historial)
 */

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import {
  uploadVideoToGemini,
  analyzeVideoWithGemini,
} from "@/app/llm/lib/gemini-analyzer";
import { generateReportPdf } from "@/app/llm/lib/pdf-generator";
import { sendReportViaWebhook } from "@/app/llm/lib/email-webhook";

const ALLOWED_MIMES = ["video/mp4", "video/quicktime"];

function getExtFromMime(mime: string): string {
  if (mime === "video/quicktime") return ".mov";
  return ".mp4";
}

export async function POST(request: Request) {
  let tempPath: string | null = null;

  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const email = formData.get("email") as string | null;
    const modelId = formData.get("model") as string | null;

    if (!videoFile || typeof videoFile === "string") {
      return NextResponse.json(
        { error: "Debes subir un archivo de video" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido" },
        { status: 400 }
      );
    }

    const mime = videoFile.type;
    if (!ALLOWED_MIMES.includes(mime)) {
      return NextResponse.json(
        { error: "Solo se permiten archivos .mp4 o .mov" },
        { status: 400 }
      );
    }

    const ext = getExtFromMime(mime);
    tempPath = path.join(os.tmpdir(), `video-${Date.now()}${ext}`);

    const arrayBuffer = await videoFile.arrayBuffer();
    await fs.writeFile(tempPath, Buffer.from(arrayBuffer));

    const { fileUri, mimeType } = await uploadVideoToGemini(tempPath, mime);

    const analysisResult = await analyzeVideoWithGemini(
      fileUri,
      mimeType,
      modelId?.trim() || undefined
    );

    const pdfBuffer = await generateReportPdf(analysisResult);

    await sendReportViaWebhook(email.trim(), pdfBuffer, "reporte-analisis-papa.pdf");

    return NextResponse.json({
      success: true,
      message: "Análisis completado. Revisa tu correo para el PDF.",
      analysis: analysisResult,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta. Contacta al administrador." },
        { status: 500 }
      );
    }

    if (message.includes("SEND_EMAIL_WEBHOOK") || message.includes("Webhook")) {
      return NextResponse.json(
        { error: "Error al enviar el correo. Verifica la configuración del webhook." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignorar errores de limpieza
      }
    }
  }
}
