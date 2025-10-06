import { config } from 'dotenv';
config();

import '@/ai/flows/detect-spanish-language.ts';
import '@/ai/flows/generate-document-summary.ts';
import '@/ai/flows/extract-text-from-file.ts';
