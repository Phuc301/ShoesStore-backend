import { Request, Response } from 'express';
import cartItemService from '../services/cartItem.service';
import { successResponse, errorResponse } from '../utils/apiResponse.util';

const cartItemController = {
  add: async (req: Request, res: Response) => {
    try {
      const cartId = Number(req.params.cartId);
      const items = await cartItemService.addItems(cartId, req.body);
      res.status(201).json(successResponse('Items added', items));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getByCart: async (req: Request, res: Response) => {
    try {
      const cartId = Number(req.params.cartId);
      const items = await cartItemService.getItemsByCart(cartId);
      res.status(200).json(successResponse('Cart items fetched', items));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  getByCartCount: async (req: Request, res: Response) => {
    try {
      const cartId = Number(req.params.cartId);
      const count = await cartItemService.getItemsCountByCart(cartId);
      res.status(200).json(successResponse('Cart item count fetched', count));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const cartItemId = Number(req.params.id);
      const item = await cartItemService.updateItem(cartItemId, req.body);
      res.status(200).json(successResponse('Item updated', item));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  remove: async (req: Request, res: Response) => {
    try {
      const cartItemId = Number(req.params.id);
      const item = await cartItemService.removeItem(cartItemId);
      res.status(200).json(successResponse('Item removed', item));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default cartItemController;
