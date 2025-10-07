'use client';

import { Loader2, Upload, Send, Trash2 } from 'lucide-react';

interface UploadFormProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onReset: () => void;
  fileName: string | null;
  loading: boolean;
  error: string | null;
}

export default function UploadForm({
  onFileChange,
  onSubmit,
  onReset,
  fileName,
  loading,
  error,
}: UploadFormProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all flex items-center gap-2 px-4 py-2 rounded-lg"
      >
        <Upload size={20} />
        {fileName || 'Seleccionar archivo'}
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".pdf, .docx"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={onSubmit}
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
          onClick={onReset}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Trash2 size={18} /> Limpiar
        </button>
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
}
