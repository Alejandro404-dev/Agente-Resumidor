/**
 * @fileOverview
 * analyzeDocument.ts - Analiza el texto del documento para apoyar decisiones
 * en el agente inteligente (tipo de resumen, nivel de detalle, etc.).
 */

export interface DocumentAnalysis {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  complexity: 'simple' | 'technical' | 'narrative';
  language: 'es' | 'unknown';
}

/**
 * Analiza el texto de entrada y retorna estadísticas básicas.
 */
export function analyzeDocument(text: string): DocumentAnalysis {
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Contar palabras y oraciones
  const words = cleanText.split(/\s+/);
  const sentences = cleanText.split(/[.!?]+/);

  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = Math.round(wordCount / sentenceCount);

  // Detectar si el texto parece técnico (basado en vocabulario)
  const technicalKeywords = [
    'algoritmo',
    'sistema',
    'proceso',
    'energía',
    'código',
    'software',
    'biología',
    'modelo',
    'ingeniería',
    'técnico',
    'científico',
    'datos',
  ];

  const technicalMatches = technicalKeywords.filter(k =>
    cleanText.toLowerCase().includes(k)
  );

  let complexity: 'simple' | 'technical' | 'narrative' = 'simple';
  if (technicalMatches.length >= 3) complexity = 'technical';
  else if (avgSentenceLength > 20) complexity = 'narrative';

  // Verificar si está en español (detección básica)
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'una'];
  const spanishMatches = spanishWords.filter(w =>
    cleanText.toLowerCase().includes(` ${w} `)
  );
  const language: 'es' | 'unknown' =
    spanishMatches.length >= 2 ? 'es' : 'unknown';

  return {
    wordCount,
    sentenceCount,
    avgSentenceLength,
    complexity,
    language,
  };
}
