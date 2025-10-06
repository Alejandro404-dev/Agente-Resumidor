'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting text from PDF and DOCX files.
 *
 * The flow:
 * - Accepts a file buffer and MIME type.
 * - Validates file size and type.
 * - Extracts text content using appropriate parsers.
 * - Returns the extracted text.
 *
 * @exports extractTextFromFile - The main function to extract text.
 * @exports ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * @exports ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import mammoth from 'mammoth';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ExtractTextFromFileInputSchema = z.object({
  fileAsDataUrl: z.string().describe("The file encoded as a data URL."),
});
export type ExtractTextFromFileInput = z.infer<
  typeof ExtractTextFromFileInputSchema
>;

const ExtractTextFromFileOutputSchema = z.object({
  text: z.string().optional(),
  error: z.string().optional(),
});
export type ExtractTextFromFileOutput = z.infer<
  typeof ExtractTextFromFileOutputSchema
>;

export async function extractTextFromFile(
  input: ExtractTextFromFileInput
): Promise<ExtractTextFromFileOutput> {
  return extractTextFromFileFlow(input);
}

const extractTextFromFileFlow = ai.defineFlow(
  {
    name: 'extractTextFromFileFlow',
    inputSchema: ExtractTextFromFileInputSchema,
    outputSchema: ExtractTextFromFileOutputSchema,
  },
  async ({ fileAsDataUrl }) => {
    try {
      const [meta, data] = fileAsDataUrl.split(',');
      const mimeType = meta.split(';')[0].split(':')[1];
      const buffer = Buffer.from(data, 'base64');
      
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return { error: `El archivo es demasiado grande. El tamaño máximo es de ${MAX_FILE_SIZE_MB} MB.` };
      }

      let text = '';
      if (mimeType === 'application/pdf') {
        const pdfData = await pdf(buffer);
        if (pdfData.numpages > 50) {
            return { error: 'El PDF tiene demasiadas páginas. El límite es de 50 páginas.' };
        }
        text = pdfData.text;
      } else if (
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const docxResult = await mammoth.extractRawText({ buffer });
        text = docxResult.value;
      } else {
        return { error: 'Tipo de archivo no válido. Sube un PDF o DOCX.' };
      }

      if (!text) {
        return { error: 'No se pudo extraer texto del documento. Asegúrate de que el archivo no esté vacío o protegido.' };
      }

      return { text };
    } catch (e: any) {
      console.error('[extractTextFromFileFlow]', e);
      return { error: 'Hubo un error al procesar tu archivo. Asegúrate de que sea un PDF o DOCX válido.' };
    }
  }
);
