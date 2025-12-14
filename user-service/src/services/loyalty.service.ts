import { LoyaltyAction } from '../models/loyalty.model';
import { User } from '../models/user.model';

const loyaltyService = {
  // Add points
  addPoints: async (userId: number, points: number, reason?: string) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    user.loyaltyPoints += points;
    await user.save();

    await LoyaltyAction.create({
      userId,
      points,
      reason: reason || 'Points added',
    });

    return { totalPoints: user.loyaltyPoints };
  },
  // Deduct points
  deductPoints: async (userId: number, points: number, reason?: string) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    if (user.loyaltyPoints < points) throw new Error('Not enough points');

    user.loyaltyPoints -= points;
    await user.save();

    await LoyaltyAction.create({
      userId,
      points: -points,
      reason: reason || 'Points deducted',
    });

    return { totalPoints: user.loyaltyPoints };
  },
  // Get loyalty history with points
  getHistory: async (userId: number, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const history = await LoyaltyAction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoyaltyAction.countDocuments({ userId });

    return {
      data: history,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  },
};

export default loyaltyService;
