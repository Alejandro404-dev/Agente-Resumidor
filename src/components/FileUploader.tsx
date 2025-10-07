"use client";
import React, { useState } from "react";

const SUMMARY_OPTIONS = [
  { value: "detailed", label: "Detallado" },
  { value: "medium", label: "Medio" },
  { value: "short", label: "Corto" },
  { value: "custom", label: "Personalizado" },
];

export default function FileUploader() {
  const [fileName, setFileName] = useState("");
  const [fileAsDataUrl, setFileAsDataUrl] = useState<string | null>(null);
  const [summaryType, setSummaryType] = useState("medium");
  const [customLength, setCustomLength] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFileAsDataUrl(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!fileAsDataUrl) {
      alert("Selecciona un archivo PDF o DOCX primero.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileAsDataUrl,
          summaryType,
          customLength: summaryType === "custom" ? customLength : undefined,
        }),
      });
      const data = await res.json();
      if (!data || data.error) {
        alert(data.error || "Error al procesar");
      } else {
        setResult(data.summary);
      }
    } catch (e) {
      alert("Error de red o servidor");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Subir documento (.pdf/.docx)</h2>

      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      {fileName && <p className="mt-2">📄 {fileName}</p>}

      <div className="mt-4">
        <label className="block font-medium">Tipo de resumen</label>
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
          className="mt-1 p-2 border rounded"
        >
          {SUMMARY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {summaryType === "custom" && (
        <div className="mt-3">
          <label>Longitud personalizada (ej. "100 palabras" o "5 líneas")</label>
          <input
            type="text"
            value={customLength}
            onChange={(e) => setCustomLength(e.target.value)}
            placeholder="Ej: 100 palabras"
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Procesando..." : "Generar resumen"}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-bold">{result.summaryTitle}</h3>
          <p className="whitespace-pre-wrap mt-2">{result.summaryText}</p>
          <p className="mt-2 text-sm text-gray-600">Método: {result.summaryType}</p>
        </div>
      )}
    </div>
  );
}
