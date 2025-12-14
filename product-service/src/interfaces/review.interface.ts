import { SentimentType } from '../enums/sentiment.enum';

export interface IReview {
  reviewId: number;
  productId: number;
  // User login
  userId?: number;
  // Guest
  guestName?: string;
  guestEmail?: string;
  // Rating only for logged in user
  rating?: number;
  sentiment?: SentimentType;
  // Comment
  title: string;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
  isGuest?: boolean;
}
