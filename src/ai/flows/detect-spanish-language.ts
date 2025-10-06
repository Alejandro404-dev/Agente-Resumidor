'use server';

/**
 * @fileOverview This file defines a Genkit flow to detect if a given text is in Spanish.
 *
 * The flow takes a text string as input and returns a boolean indicating whether the text is in Spanish.
 * - detectSpanishLanguage - A function that detects if the input text is in Spanish.
 * - DetectSpanishLanguageInput - The input type for the detectSpanishLanguage function.
 * - DetectSpanishLanguageOutput - The return type for the detectSpanishLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSpanishLanguageInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type DetectSpanishLanguageInput = z.infer<typeof DetectSpanishLanguageInputSchema>;

const DetectSpanishLanguageOutputSchema = z.object({
  isSpanish: z.boolean().describe('True if the text is in Spanish, false otherwise.'),
});
export type DetectSpanishLanguageOutput = z.infer<typeof DetectSpanishLanguageOutputSchema>;

export async function detectSpanishLanguage(input: DetectSpanishLanguageInput): Promise<DetectSpanishLanguageOutput> {
  return detectSpanishLanguageFlow(input);
}

const detectSpanishLanguagePrompt = ai.definePrompt({
  name: 'detectSpanishLanguagePrompt',
  input: {schema: DetectSpanishLanguageInputSchema},
  output: {schema: DetectSpanishLanguageOutputSchema},
  prompt: `Determine whether the following text is written in Spanish. Return true if it is, and false if it is not.\n\nText: {{{text}}}`,
});

const detectSpanishLanguageFlow = ai.defineFlow(
  {
    name: 'detectSpanishLanguageFlow',
    inputSchema: DetectSpanishLanguageInputSchema,
    outputSchema: DetectSpanishLanguageOutputSchema,
  },
  async input => {
    const {output} = await detectSpanishLanguagePrompt(input);
    return output!;
  }
);
