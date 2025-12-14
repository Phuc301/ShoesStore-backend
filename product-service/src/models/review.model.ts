import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../interfaces/review.interface';
import { getNextSequence } from './counter.model';
import { DB_COLLECTIONS } from '../constants/collections.constant';
import { SentimentType } from '../enums/sentiment.enum';

export interface IReviewDoc extends IReview, Document {}

const reviewSchema = new Schema<IReviewDoc>(
  {
    reviewId: { type: Number, unique: true },
    productId: { type: Number, required: true },
    userId: { type: Number, required: false },
    guestName: { type: String, required: false },
    guestEmail: { type: String, required: false },
    title: { type: String, required: false },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    sentiment: {
      type: String,
      enum: Object.values(SentimentType),
    },
    isGuest: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.pre('save', async function (next) {
  if (!this.reviewId) {
    this.reviewId = await getNextSequence(DB_COLLECTIONS.REVIEWS);
  }

  // if (this.rating && !this.userId) {
  //   return next(new Error('Guest users cannot leave a rating.'));
  // }
  next();
});

export const Review = mongoose.model<IReviewDoc>(
  DB_COLLECTIONS.REVIEWS,
  reviewSchema
);
