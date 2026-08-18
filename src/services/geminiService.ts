import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let client: GoogleGenerativeAI | null = null;

export function initializeGemini() {
  if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY no configurada en .env');
    return null;
  }

  if (!client) {
    client = new GoogleGenerativeAI(API_KEY);
  }
  return client;
}

export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const gemini = initializeGemini();
    if (!gemini) {
      return '❌ API no configurada. Verifica VITE_GEMINI_API_KEY en .env';
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error Gemini:', error);
    return `❌ Error: ${error.message || 'Fallo en la API de Gemini'}`;
  }
}

export async function streamWithGemini(
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const gemini = initializeGemini();
    if (!gemini) {
      onChunk('❌ API no configurada. Verifica VITE_GEMINI_API_KEY en .env');
      return;
    }

    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      onChunk(text);
    }
  } catch (error: any) {
    console.error('Error streaming Gemini:', error);
    onChunk(`❌ Error: ${error.message || 'Fallo en la API de Gemini'}`);
  }
}

export function isGeminiConfigured(): boolean {
  return !!API_KEY;
}
