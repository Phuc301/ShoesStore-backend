import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiReponose.util';
import userService from '../services/user.service';

const userController = {
  // Get user profile
  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const user = await userService.getById(userId);
      res.status(200).json(successResponse('User profile fetched', user));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const user = await userService.updateProfile(userId, req.body);
      res.status(200).json(successResponse('Profile updated', user));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // List users (admin only)
  listUsers: async (_req: Request, res: Response) => {
    try {
      const page = Number(_req.query.page) || 1;
      const limit = Number(_req.query.limit) || 10;
      const isActive = _req.query.isActive
        ? _req.query.isActive === 'true'
        : undefined;
      const users = await userService.listUsers(page, limit, isActive);
      res.status(200).json(successResponse('Users fetched', users));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // View details of a specific user (admin only)
  getUserDetails: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const user = await userService.getById(userId);
      if (!user) throw new Error('User not found');
      res.status(200).json(successResponse('User details fetched', user));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update user profile
  updateProfileUserByAdmin: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const user = await userService.updateProfile(userId, req.body);
      res.status(200).json(successResponse('Profile updated', user));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Delete user (admin only)
  deleteUser: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const result = await userService.deleteUser(userId);
      res.status(200).json(successResponse('User deleted', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get public user info
  getPublicInfoList: async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json(errorResponse('userIds must be a non-empty array'));
      }

      const users = await userService.getManyPublicInfo(userIds);

      const formatted = users.map((u) => ({
        userId: u.userId,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
      }));

      res
        .status(200)
        .json(successResponse('Public users info fetched', formatted));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getStats: async (req: Request, res: Response) => {
    try {
      const stats = await userService.getCustomerStats();
      res.json(successResponse('Customer stats fetched', stats));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
};

export default userController;
