import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiReponose.util';
import loyaltyService from '../services/loyalty.service';

const loyaltyController = {
  // Add points
  addPoints: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { points, reason } = req.body;
      const result = await loyaltyService.addPoints(userId, points, reason);
      res.status(200).json(successResponse('Points added', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Deduct points
  deductPoints: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { points, reason } = req.body;
      const result = await loyaltyService.deductPoints(userId, points, reason);
      res.status(200).json(successResponse('Points deducted', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get loyalty history with points
  getHistory: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const history = await loyaltyService.getHistory(userId, page, limit);

      res.status(200).json(successResponse('Loyalty history fetched', history));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default loyaltyController;
