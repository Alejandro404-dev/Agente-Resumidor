import { NextResponse } from 'next/server';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';
import { generateDocumentSummary } from '@/ai/flows/generate-document-summary';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se subió ningún archivo.' }, { status: 400 });
    }

    // Extrae texto del archivo (PDF o DOCX)
    const { text, error } = await extractTextFromFile(file);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // Genera el resumen
    const summaryText = await generateDocumentSummary({ documentText: text || '' });

    return NextResponse.json({
      summaryTitle: file.name,
      summaryText,
    });
  } catch (err: any) {
    console.error('Error en /api/summarize:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
