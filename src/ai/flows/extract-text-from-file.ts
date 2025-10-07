import mammoth from 'mammoth';
import { pdf } from 'pdf-parse';

export async function extractTextFromFile(file: File) {
  const fileType = file.type;
  const buffer = await file.arrayBuffer();

  try {
    if (fileType === 'application/pdf') {
      const data = await pdf(Buffer.from(buffer));
      return { text: data.text };
    } else if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({
        arrayBuffer: buffer,
      });
      return { text: value };
    } else {
      return { error: 'Formato no soportado. Usa PDF o DOCX.' };
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      error: 'Ocurrió un error al procesar el archivo.',
    };
  }
}
