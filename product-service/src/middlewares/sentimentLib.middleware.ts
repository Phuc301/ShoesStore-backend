import { Request, Response, NextFunction } from 'express';
import Sentiment from 'sentiment';
import { SentimentType } from '../enums/sentiment.enum';

const sentimentAnalyzer = new Sentiment();

export function sentimentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const comment: string = req.body.comment;
    if (!comment) {
      res.status(400).json({ error: 'Comment is required' });
      return;
    }

    const result = sentimentAnalyzer.analyze(comment);

    let sentiment: SentimentType = SentimentType.Neutral;
    if (result.score > 0) sentiment = SentimentType.Positive;
    else if (result.score < 0) sentiment = SentimentType.Negative;

    req.body.sentiment = sentiment;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Sentiment middleware failed' });
  }
}
