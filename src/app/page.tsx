'use client';

import { useState } from 'react';
import Head from 'next/head';
import UploadForm from '@/components/UploadForm';
import SummaryDisplay from '@/components/SummaryDisplay';

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
      <Head>
        <title>Agente Resumidor de Documentos</title>
      </Head>

      <div className="w-full max-w-2xl bg-gray-800/80 rounded-2xl shadow-lg border border-gray-700 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🧠 Agente Resumidor de Documentos
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Sube un documento en formato PDF o Word, y el agente generará un resumen automático en español.
        </p>

        <UploadForm
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
          fileName={file?.name || null}
          loading={loading}
          error={error}
        />

        <SummaryDisplay title={summaryTitle} summary={summary} />
      </div>

      <footer className="mt-10 text-sm text-gray-500">
        Desarrollado por <span className="text-blue-400">Alejandro Teherán</span> — Universidad Tecnológica de Bolívar
      </footer>
    </main>
  );
}
