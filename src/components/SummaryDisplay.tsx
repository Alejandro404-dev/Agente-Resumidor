'use client';

interface SummaryDisplayProps {
  title: string | null;
  summary: string | null;
}

export default function SummaryDisplay({ title, summary }: SummaryDisplayProps) {
  if (!summary) return null;

  return (
    <div className="mt-8 bg-gray-900/60 rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-semibold mb-2 text-blue-400">
        {title || 'Resumen generado'}
      </h2>
      <p className="text-gray-200 leading-relaxed whitespace-pre-line">
        {summary}
      </p>
    </div>
  );
}
