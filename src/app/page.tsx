'use client';

import { useState } from 'react';
import { Loader2, FileText, Upload, Send, Trash2 } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryTitle, setSummaryTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
      setSummary(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo PDF o Word.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setSummaryTitle(data.summaryTitle);
      setSummary(data.summaryText);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar el resumen.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSummary(null);
    setSummaryTitle(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white px-4 py-10">
      <div className="w-full max-w-2xl bg-gray-800/80 rounded-2xl shadow-lg border border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🧠 Agente Resumidor de Documentos
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Sube un documento en formato PDF o Word, y el agente generará un resumen automático en español.
        </p>

        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Upload size={20} />
            {file ? file.name : 'Seleccionar archivo'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf, .docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Generando...
                </>
              ) : (
                <>
                  <Send size={18} /> Generar resumen
                </>
              )}
            </button>

            <button
              onClick={resetForm}
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Trash2 size={18} /> Limpiar
            </button>
          </div>

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        {summary && (
          <div className="mt-8 bg-gray-900/60 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">
              {summaryTitle || 'Resumen generado'}
            </h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        Desarrollado por <span className="text-blue-400">Alejandro Teherán</span> — Universidad Tecnológica de Bolívar
      </footer>
    </main>
  );
}
