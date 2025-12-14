import { Request, Response } from 'express';
import reviewService from '../services/review.service';
import { successResponse, errorResponse } from '../utils/apiReponose.util';
import { SentimentType } from '../enums/sentiment.enum';

const reviewController = {
  // Create
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const review = await reviewService.createReview(req.body, userId);
      res.status(201).json(successResponse('Review created', review));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get reviews by product
  getProductReviews: async (req: Request, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const isGuest = req.query.isGuest === 'true';

      const sentiment = req.query.sentiment as SentimentType | undefined;

      const result = await reviewService.getProductReviews(
        productId,
        isGuest,
        page,
        limit,
        sentiment
      );

      res.status(200).json(successResponse('Reviews fetched', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get review by ID
  getById: async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.id);
      const review = await reviewService.getReviewById(reviewId);
      res.status(200).json(successResponse('Review fetched', review));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update review
  update: async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.id);
      const userId = Number(req.headers['x-user-id']);
      const review = await reviewService.updateReview(
        reviewId,
        req.body,
        userId
      );
      res.status(200).json(successResponse('Review updated', review));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Delete review
  delete: async (req: Request, res: Response) => {
    try {
      const reviewId = Number(req.params.id);
      const userId = Number(req.headers['x-user-id']);
      const review = await reviewService.deleteReview(reviewId, userId);
      res.status(200).json(successResponse('Review deleted', review));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default reviewController;
