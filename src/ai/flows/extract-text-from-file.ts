// src/ai/flows/extract-text-from-file.ts
import pdf from "pdf-parse";
import * as mammoth from "mammoth";

export interface ExtractResult {
  text?: string;
  error?: string;
}

/**
 * Extrae texto desde:
 *  - un File (forma en que llega desde req.formData() en Next),
 *  - un Buffer,
 *  - o un dataURL (opcional).
 */
export async function extractTextFromFile(input: File | Buffer | { fileAsDataUrl: string }): Promise<ExtractResult> {
  try {
    let buffer: Buffer;
    let mimeType = "";

    // Caso 1: llega un File (formData en el server)
    if (typeof (input as any).arrayBuffer === "function") {
      const file = input as File;
      const ab = await file.arrayBuffer();
      buffer = Buffer.from(ab);
      mimeType = file.type || "";
    }
    // Caso 2: Buffer directo
    else if (Buffer.isBuffer(input as Buffer)) {
      buffer = input as Buffer;
      mimeType = "";
    }
    // Caso 3: dataURL { fileAsDataUrl: "data:...;base64,..." }
    else if ((input as any).fileAsDataUrl) {
      const dataUrl = (input as any).fileAsDataUrl as string;
      const parts = dataUrl.split(",");
      const meta = parts[0] || "";
      const b64 = parts[1] || "";
      mimeType = (meta.match(/data:(.*?);base64/) || [])[1] || "";
      buffer = Buffer.from(b64, "base64");
    } else {
      return { error: "Entrada inválida para extractTextFromFile." };
    }

    const low = (mimeType || "").toLowerCase();

    // PDF
    if (low.includes("pdf") || low === "" && buffer.slice(0, 4).toString() === "%PDF") {
      const data = await pdf(buffer);
      return { text: data.text || "" };
    }

    // DOCX (Office Open XML)
    if (low.includes("officedocument") || low.includes("wordprocessingml") || low.includes("docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value || "" };
    }

    // fallback: intentar mammoth por si buffer corresponde a docx aunque mime no lo diga
    try {
      const tryM = await mammoth.extractRawText({ buffer });
      if (tryM && tryM.value && tryM.value.trim().length > 0) {
        return { text: tryM.value };
      }
    } catch (_) { /* ignore */ }

    return { error: "Formato no soportado. Usa PDF o DOCX." };
  } catch (err: any) {
    console.error("extractTextFromFile error:", err);
    return { error: "Error al extraer texto del archivo." };
  }
}
