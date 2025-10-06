'use client';

import {
  useActionState,
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from 'react';
import { useDropzone } from 'react-dropzone';

import type { GenerateDocumentSummaryOutput } from '@/ai/flows/generate-document-summary';
import { detectSpanishLanguage } from '@/ai/flows/detect-spanish-language';
import { generateDocumentSummary } from '@/ai/flows/generate-document-summary';
import { extractTextFromFile } from '@/ai/flows/extract-text-from-file';
import { useToast } from '@/hooks/use-toast';

import {
  BrainCircuit,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type FormState = {
  summary?: GenerateDocumentSummaryOutput;
  error?: string;
  timestamp?: number;
};

async function summarizeAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const text = formData.get('documentText') as string;
  const fileDataUrl = formData.get('fileDataUrl') as string;
  const summaryType = formData.get('summaryType') as 'detailed' | 'medium' | 'short' | 'custom';
  const customLength = formData.get('customLength') as string;


  let documentText = text;

  if (fileDataUrl) {
    const extractionResult = await extractTextFromFile({
      fileAsDataUrl: fileDataUrl,
    });
    if (extractionResult.error) {
      return {
        error: extractionResult.error,
        timestamp: Date.now(),
      };
    }
    documentText = extractionResult.text || '';
  }

  if (!documentText || documentText.trim().length < 100) {
    if (fileDataUrl) {
      // If a file was uploaded but no text was extracted
      return {
        error:
          'No se pudo extraer texto del documento. Asegúrate de que el archivo no esté vacío o protegido por contraseña.',
        timestamp: Date.now(),
      };
    }
    return {
      error: 'El texto es demasiado corto. Introduce al menos 100 caracteres.',
      timestamp: Date.now(),
    };
  }

  try {
    const langDetection = await detectSpanishLanguage({ text: documentText });
    if (!langDetection.isSpanish) {
      return {
        error:
          'El texto no está en español. Por favor, proporciona un texto en español.',
        timestamp: Date.now(),
      };
    }

    const summaryResult = await generateDocumentSummary({
      documentText: documentText,
      summaryType: summaryType,
      customLength: customLength,
    });
    return { summary: summaryResult, timestamp: Date.now() };
  } catch (e) {
    console.error(e);
    return {
      error:
        'No se pudo generar el resumen. Por favor, verifica que el texto sea legible y coherente.',
      timestamp: Date.now(),
    };
  }
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Resumir
    </Button>
  );
}

function SummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-6 w-24 rounded-full" />
      </CardFooter>
    </Card>
  );
}

function SummaryDisplay({
  summary,
}: {
  summary: GenerateDocumentSummaryOutput;
}) {
  return (
    <Card className="animate-in fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">
              {summary.summaryTitle}
            </CardTitle>
            <CardDescription>Tu resumen generado por IA.</CardDescription>
          </div>
          <Button variant="outline" size="icon" disabled>
            <Download className="h-4 w-4" />
            <span className="sr-only">Descargar resumen</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{summary.summaryText}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="secondary">{summary.summaryType}</Badge>
      </CardFooter>
    </Card>
  );
}

function FileUploader({
  onFileSelect,
  disabled,
}: {
  onFileSelect: (file: File | null, dataUrl: string | null) => void;
  disabled: boolean;
}) {
  const { toast } = useToast();
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Error de Archivo',
          description:
            'Archivo no válido. Solo se permiten archivos PDF y DOCX de hasta 5MB.',
        });
        return;
      }
      const selectedFile = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        onFileSelect(selectedFile, reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    },
    [onFileSelect, toast]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        type="button"
        variant="outline"
        onClick={open}
        disabled={disabled}
      >
        <Paperclip />
        Adjuntar archivo (PDF, DOCX)
      </Button>
    </div>
  );
}

export function Summarizer() {
  const { toast } = useToast();
  const initialState: FormState = { timestamp: Date.now() };
  const [state, formAction] = useActionState(summarizeAction, initialState);
  const [isPending, setIsPending] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [summaryType, setSummaryType] = useState('medium');
  const [customLength, setCustomLength] = useState('');

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error de Procesamiento',
        description: state.error,
      });
    }
    setIsPending(false);
  }, [state.error, state.timestamp, toast]);

  const handleFileSelect = (
    selectedFile: File | null,
    dataUrl: string | null
  ) => {
    setFile(selectedFile);
    setFileDataUrl(dataUrl);
    // Clear textarea when a file is selected
    if (selectedFile && textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileDataUrl(null);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    if (file) {
      formData.set('documentText', ''); // Clear text if file is present
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="grid gap-8">
        <form ref={formRef} action={formAction} onSubmit={handleFormSubmit}>
          {fileDataUrl && (
            <input type="hidden" name="fileDataUrl" value={fileDataUrl} />
          )}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="font-headline text-2xl">
                    Ingresa tu Documento
                  </CardTitle>
                  <CardDescription>
                    Pega el texto o sube un archivo para generar un resumen.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Tipo de Resumen</Label>
                  <RadioGroup
                    name="summaryType"
                    value={summaryType}
                    onValueChange={setSummaryType}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed">🟢 Detallado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">🟡 Mediano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">🔵 Corto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom">⚪ Personalizado</Label>
                    </div>
                  </RadioGroup>
                </div>

                {summaryType === 'custom' && (
                  <Input
                    name="customLength"
                    placeholder="Ej: 150 palabras, 10 líneas"
                    value={customLength}
                    onChange={(e) => setCustomLength(e.target.value)}
                  />
                )}

                <Textarea
                  ref={textAreaRef}
                  name="documentText"
                  placeholder="El análisis de los datos revela una tendencia creciente en la adopción de energías renovables..."
                  rows={12}
                  className="text-base"
                  minLength={100}
                  disabled={!!file}
                />
                {file && (
                  <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={removeFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Quitar archivo</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <FileUploader onFileSelect={handleFileSelect} disabled={isPending} />
              <SubmitButton isPending={isPending} />
            </CardFooter>
          </Card>
        </form>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-2 text-muted-foreground">
              <BrainCircuit className="h-6 w-6" />
            </span>
          </div>
        </div>

        <div className="min-h-[200px]">
          {isPending && <SummarySkeleton />}
          {state.summary && !isPending && (
            <SummaryDisplay summary={state.summary} />
          )}
          {!state.summary && !isPending && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg h-full">
              <BrainCircuit className="h-12 w-12 mb-4" />
              <p className="font-headline text-lg">
                Tu resumen aparecerá aquí
              </p>
              <p className="text-sm">
                Introduce tu texto o sube un archivo y haz clic en "Resumir"
                para comenzar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
