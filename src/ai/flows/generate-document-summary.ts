import { ai } from "../genkit";

// 📘 Entrada
export interface GenerateDocumentSummaryInput {
  documentText: string;
  summaryType?: "short" | "medium" | "long" | "custom" | "detailed";
  customLength?: number | string | null;
}

// 📗 Salida esperada (lo que usa summarizer.tsx)
export interface GenerateDocumentSummaryOutput {
  summaryTitle: string;
  summaryText: string;
  summaryType: string;
}

// 🧠 Función principal
export async function generateDocumentSummary({
  documentText,
  summaryType = "medium",
  customLength,
}: GenerateDocumentSummaryInput): Promise<GenerateDocumentSummaryOutput> {
  try {
    const prompt = `
Eres un asistente especializado en análisis de documentos.
Resume el siguiente texto de forma ${summaryType}${
      customLength ? ` (aproximadamente ${customLength})` : ""
    }.
Sé claro, coherente y conserva las ideas principales.

Documento:
"""
${documentText}
"""
`;

    // Generación con Genkit
    const result = await ai.generate({
      prompt,
      config: {
        maxOutputTokens:
          summaryType === "short"
            ? 200
            : summaryType === "medium"
            ? 500
            : 1000,
        temperature: 0.5,
      },
    });

    // 🔹 Construimos una salida con estructura
    const summaryText = result.text ?? "No se generó resumen.";
    const summaryTitle = "Resumen del documento";

    return {
      summaryTitle,
      summaryText,
      summaryType,
    };
  } catch (error: any) {
    console.error("Error en generateDocumentSummary:", error);
    return {
      summaryTitle: "Error al generar resumen",
      summaryText: "Hubo un problema al procesar el documento.",
      summaryType: "error",
    };
  }
}
