'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating summaries of documents in Spanish.
 *
 * The flow:
 * - Accepts document text and a summary type as input.
 * - Determines the best summarization technique (extractive, abstractive, or mixed).
 * - Generates a concise summary of the document based on the requested length and detail.
 * - Returns the summary, suggested title, and summarization type.
 *
 * @exports generateDocumentSummary - The main function to generate document summaries.
 * @exports GenerateDocumentSummaryInput - The input type for the generateDocumentSummary function.
 * @exports GenerateDocumentSummaryOutput - The return type for the generateDocumentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentSummaryInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be summarized.'),
  summaryType: z
    .enum(['detailed', 'medium', 'short', 'custom'])
    .describe('The desired type of summary.'),
  customLength: z.string().nullable().optional().describe('The user-defined length for a custom summary (e.g., "100 words" or "5 lines").'),
});
export type GenerateDocumentSummaryInput = z.infer<
  typeof GenerateDocumentSummaryInputSchema
>;

const GenerateDocumentSummaryOutputSchema = z.object({
  summaryTitle: z.string().describe('A suggested title for the summary.'),
  summaryText: z.string().describe('The generated summary of the document.'),
  summaryType: z
    .enum(['extractive', 'abstractive', 'mixed'])
    .describe('The type of summarization technique used.'),
});
export type GenerateDocumentSummaryOutput = z.infer<
  typeof GenerateDocumentSummaryOutputSchema
>;

export async function generateDocumentSummary(
  input: GenerateDocumentSummaryInput
): Promise<GenerateDocumentSummaryOutput> {
  return generateDocumentSummaryFlow(input);
}

const generateDocumentSummaryPrompt = ai.definePrompt({
  name: 'generateDocumentSummaryPrompt',
  input: {schema: GenerateDocumentSummaryInputSchema},
  output: {schema: GenerateDocumentSummaryOutputSchema},
  prompt: `You are an intelligent agent specialized in summarizing long documents in Spanish.
Your task is to generate coherent, concise, and accurate summaries from text extracted from PDF or DOCX documents provided by the user.

CONTEXT:
You are part of an academic and experimental system developed by Systems and Computer Engineering students. Your role is to demonstrate the practical application of Natural Language Processing (NLP) techniques in the automatic generation of summaries.

OBJECTIVE:
Analyze the input text and produce a summary that captures the most important ideas, maintaining the coherence and fidelity of the original message.

HOW IT WORKS:
- The summary must be 20% to 30% compressed compared to the original text unless a different length is specified.
- Use a formal, natural tone and be written in neutral Spanish.
- Include the main ideas, relationships between concepts, and the most relevant conclusions.
- Avoid redundancies, repetitions, or unnecessary explanations.

SUMMARIZATION METHOD:
- Use a mixed approach, combining extractive (selecting key phrases) and abstractive (rewriting content) techniques. This is the preferred method.

USER-SELECTED SUMMARY TYPE:
- The user has selected the following summary type: {{{summaryType}}}.
{{#if customLength}}- Custom length specified: {{{customLength}}}.{{/if}}

SUMMARY TYPE GUIDELINES:
- **Detailed**: Includes all key points, full explanations, and relevant examples. The summary should be closer to 30% of the original text length.
- **Medium**: Summarizes the main ideas and essential concepts, with an intermediate level of detail. The summary should be around 20-25% of the original text length. This is the default if no specific instruction is given.
- **Short**: Provides a brief summary with only the most important ideas. The summary should be concise, around 10-15% of the original text.
- **Custom**: The user has provided a specific length. Adhere to the user's request: "{{{customLength}}}".

LIMITATIONS:
- Do not invent information or add external content.
- Do not include personal opinions or fabricated examples.
- The summary should not exceed 300 words unless "Detailed" is requested for a very long text.

RESPONSE FORMAT:
Please respond only with the final summary, without additional explanations or process steps.

Document Text: {{{documentText}}}

Ensure the summary is in Spanish, clear, informative, and maintains a natural tone, adhering to the selected summary type: {{{summaryType}}}.
  `,
});

const generateDocumentSummaryFlow = ai.defineFlow(
  {
    name: 'generateDocumentSummaryFlow',
    inputSchema: GenerateDocumentSummaryInputSchema,
    outputSchema: GenerateDocumentSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateDocumentSummaryPrompt(input);
    return output!;
  }
);
