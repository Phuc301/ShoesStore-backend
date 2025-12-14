import fetch, { Headers } from 'node-fetch';
import { FormData, File, Blob } from 'formdata-node';
import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';

(global as any).Headers = Headers;
(globalThis as any).fetch = fetch;
(global as any).FormData = FormData;
(global as any).File = File;
(global as any).Blob = Blob;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sentimentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const comment = req.body.comment;
    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a sentiment classifier. Reply with Positive, Negative, or Neutral only.',
        },
        { role: 'user', content: comment },
      ],
    });

    const sentiment =
      completion.choices[0].message?.content?.trim() || 'Neutral';

    req.body.sentiment = sentiment;
    next();
  } catch (error) {
    console.error('Sentiment middleware failed:', error);
    res.status(500).json({ error: 'Sentiment middleware failed' });
  }
}
