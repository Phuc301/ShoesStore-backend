import { Review } from '../models/review.model';
import { IReview } from '../interfaces/review.interface';
import { SentimentType } from '../enums/sentiment.enum';
import { Product } from '../models/product.model';
import { analyzeSentiment } from '../utils/sentimentAnalyzer.util';
import { userClient, userServiceEndpoints } from '../clients/user.client';

const reviewService = {
  // Create review
  createReview: async (
    data: Partial<IReview>,
    userId?: number,
    userName?: string,
    avatar?: string
  ) => {
    if (userId) data.userId = userId;
    // Check comment exists
    if (data.comment) {
      try {
        const sentiment = await analyzeSentiment(data.comment);
        data.sentiment = sentiment as SentimentType;
      } catch (err) {
        console.error('Sentiment analysis failed, default Neutral:', err);
        data.sentiment = 'Neutral' as SentimentType;
      }
    }
    // Create
    const review = await Review.create(data);
    if (data.productId) {
      // Comments count
      const commentsCount = await Review.countDocuments({
        productId: data.productId,
        comment: { $exists: true, $ne: '' },
      });
      // Ratings
      const ratings = await Review.find({
        productId: data.productId,
        rating: { $exists: true, $ne: null },
      }).select('rating');
      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
          : 0;
      // Update product
      await Product.findOneAndUpdate(
        { productId: data.productId },
        {
          totalReviews: commentsCount,
          averageRating,
        },
        { new: true }
      );
    }
    return { review, userName, avatar };
  },
  // Get reviews by product with pagination
  getProductReviews: async (
    productId: number,
    isGuest: boolean,
    page: number = 1,
    limit: number = 5,
    sentiment?: SentimentType
  ) => {
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { productId };
    if (sentiment) filter.sentiment = sentiment;
    filter.isGuest = isGuest;

    // Fetch reviews
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(filter);
    const hasMore = page * limit < total;

    // Get user info if not guest
    let userInfoMap: Record<number, { fullName: string; avatarUrl: string }> =
      {};

    if (!isGuest) {
      const userIds = Array.from(
        new Set(reviews.map((r) => r.userId).filter(Boolean))
      ) as number[];

      if (userIds.length) {
        try {
          const { data } = await userClient.post(
            userServiceEndpoints.LIST_PUBLIC_INFO,
            { userIds }
          );
          const users = data.data;

          userInfoMap = users.reduce(
            (acc: any, u: any) => ({
              ...acc,
              [u.userId]: { fullName: u.fullName, avatarUrl: u.avatarUrl },
            }),
            {}
          );
        } catch (err: any) {
          console.error('Failed to fetch user info:', err.message);
        }
      }
    }

    // Map reviews to unified structure
    const results = reviews.map((r) => {
      const userInfo = !isGuest && r.userId ? userInfoMap[r.userId] : null;

      return {
        ...r,
        userName:
          userInfo?.fullName || (r.isGuest ? r.guestName || 'Guest' : 'User'),
        avatar: userInfo?.avatarUrl || null,
      };
    });

    return { reviews: results, total, hasMore };
  },
  // Get single review
  getReviewById: async (reviewId: number) => {
    const review = await Review.findOne({ reviewId });
    if (!review) throw new Error('Review not found');
    return review;
  },
  // Update review (only by owner)
  updateReview: async (
    reviewId: number,
    data: Partial<IReview>,
    userId?: number
  ) => {
    const review = await Review.findOne({ reviewId });
    if (!review) throw new Error('Review not found');
    if (review.userId && review.userId !== userId) {
      throw new Error('Not authorized to update this review');
    }

    if (data.comment) review.comment = data.comment;
    if (data.rating !== undefined) review.rating = data.rating;

    await review.save();
    return review;
  },
  // Delete review (only by owner)
  deleteReview: async (reviewId: number, userId?: number) => {
    const review = await Review.findOne({ reviewId });
    if (!review) throw new Error('Review not found');
    if (review.userId && review.userId !== userId) {
      throw new Error('Not authorized to delete this review');
    }
    await review.deleteOne();
    return review;
  },
};

export default reviewService;
