import { Request, Response } from 'express';
import cartService from '../services/cart.service';
import { successResponse, errorResponse } from '../utils/apiResponse.util';

const cartController = {
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']) || undefined;
      const sessionId = req.headers['x-session-id'] as string | undefined;
      if (!userId && !sessionId) {
        return res.status(400).json(errorResponse('Missing user or session'));
      }
      const cart = await cartService.createCart({
        userId,
        sessionId,
      });

      res.status(201).json(successResponse('Cart created', cart));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getByUserId: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const cart = await cartService.getCart(userId);
      res.status(200).json(successResponse('Cart fetched', cart));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getBySession: async (req: Request, res: Response) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      const cart = await cartService.getCart(undefined, sessionId);
      res.status(200).json(successResponse('Cart fetched', cart));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  clear: async (req: Request, res: Response) => {
    try {
      const cartId = Number(req.params.id);
      await cartService.clearCartItems(cartId);
      res.status(200).json(successResponse('Cart items cleared', null));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  mergeSessionToUser: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const sessionId =
        (req.headers['x-session-id'] as string | undefined) || '';

      if (!userId) {
        return res
          .status(400)
          .json(errorResponse('Missing userId or sessionId'));
      }
      const result = await cartService.mergeSessionCartToUser(
        userId,
        sessionId
      );
      res.status(200).json(successResponse(result.message, result.cart));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default cartController;
