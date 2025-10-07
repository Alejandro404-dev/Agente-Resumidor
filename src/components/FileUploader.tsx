"use client";
import React, { useState } from "react";

const SUMMARY_OPTIONS = [
  { value: "detailed", label: "Detallado" },
  { value: "medium", label: "Medio" },
  { value: "short", label: "Corto" },
  { value: "custom", label: "Personalizado" },
];

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [summaryType, setSummaryType] = useState("medium");
  const [customLength, setCustomLength] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Selecciona un archivo PDF o DOCX primero.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("summaryType", summaryType);
      if (summaryType === "custom") {
        formData.append("customLength", customLength);
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data || data.error) {
        alert(data.error || "Error al procesar");
      } else {
        setResult(data);
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
      {file && <p className="mt-2">📄 {file.name}</p>}

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
        </div>
      )}
    </div>
  );
}
