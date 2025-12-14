import fetch, { Headers } from 'node-fetch';
import { FormData, File, Blob } from 'formdata-node';
import { GoogleGenerativeAI } from '@google/generative-ai';

(global as any).Headers = Headers;
(globalThis as any).fetch = fetch;
(global as any).FormData = FormData;
(global as any).File = File;
(global as any).Blob = Blob;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function analyzeSentiment(comment: string): Promise<string> {
  if (!comment) throw new Error('Comment is required');

  const prompt = `
    You are a sentiment classifier.
    Classify the following comment strictly as one of: Positive, Negative, or Neutral.
    Reply with only one word.

    Comment: "${comment}"
  `;

  const result = await model.generateContent(prompt);
  const sentiment = result.response.text().trim().split(/\s+/)[0];

  return sentiment || 'Neutral';
}
