import { UserRole } from '../enums/userRole.enum';
import { User } from '../models/user.model';
import { IUserDoc } from '../models/user.model';
import moment from 'moment';

const userService = {
  // Get user by ID
  getById: async (userId: number): Promise<IUserDoc | null> => {
    return User.findOne({ userId }).select('-passwordHash');
  },
  // Update user profile
  updateProfile: async (userId: number, data: Partial<IUserDoc>) => {
    const user = await User.findOneAndUpdate({ userId }, data, {
      new: true,
    }).select('-passwordHash');
    if (!user) throw new Error('User not found');
    return user;
  },
  // List all users (admin only)
  listUsers: async (
    page: number = 1,
    limit: number = 10,
    isActive?: boolean
  ) => {
    const skip = (page - 1) * limit;

    const query: any = {
      role: { $ne: UserRole.ADMIN },
      // isRegistered: true,
    };

    // Add isActive filter if provided
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total users matching conditions
    const total = await User.countDocuments(query);

    return {
      data: users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total,
    };
  },
  // View details of a specific user (admin only)
  getUserDetails: async (userId: number) => {
    const user = await User.findOne({ userId }).select('-passwordHash');
    if (!user) throw new Error('User not found');
    return user;
  },
  // Delete user (admin only)
  deleteUser: async (userId: number) => {
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return {
      message: user.isActive
        ? 'User activated successfully'
        : 'User deactivated successfully',
      isActive: user.isActive,
    };
  },
  // Get public info of multiple users
  getManyPublicInfo: async (userIds: number[]) => {
    return User.find({ userId: { $in: userIds } })
      .select('userId fullName avatarUrl -_id')
      .lean();
  },
  // Get Customer stats
  getCustomerStats: async () => {
    const startCurrentMonth = moment().startOf('month').toDate();
    const endCurrentMonth = moment().endOf('month').toDate();

    const startPrevMonth = moment()
      .subtract(1, 'month')
      .startOf('month')
      .toDate();
    const endPrevMonth = moment().subtract(1, 'month').endOf('month').toDate();

    const matchCustomer = { role: UserRole.CUSTOMER };

    const currentNew = await User.countDocuments({
      ...matchCustomer,
      createdAt: { $gte: startCurrentMonth, $lte: endCurrentMonth },
    });

    const previousNew = await User.countDocuments({
      ...matchCustomer,
      createdAt: { $gte: startPrevMonth, $lte: endPrevMonth },
    });

    const totalPrevious = await User.countDocuments({
      ...matchCustomer,
      createdAt: { $lte: endPrevMonth },
    });

    const totalCurrent = await User.countDocuments({
      ...matchCustomer,
      createdAt: { $lte: endCurrentMonth },
    });

    const calcPercent = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Number((((cur - prev) / prev) * 100).toFixed(2));
    };

    return {
      newCustomers: {
        current: currentNew,
        previous: previousNew,
        changePercent: calcPercent(currentNew, previousNew),
      },
      totalCustomers: {
        current: totalCurrent,
        previous: totalPrevious,
        changePercent: calcPercent(totalCurrent, totalPrevious),
      },
    };
  },
};

export default userService;
