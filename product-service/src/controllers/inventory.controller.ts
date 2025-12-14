import { Request, Response } from 'express';
import inventoryService from '../services/inventory.service';
import { successResponse, errorResponse } from '../utils/apiReponose.util';

const inventoryController = {
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const record = await inventoryService.createInventoryRecord({
        ...req.body,
        userId,
      });
      res.status(201).json(successResponse('Inventory record created', record));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { productId, sku, page, limit } = req.query;
      const result = await inventoryService.getAllHistory(
        {
          productId: productId ? Number(productId) : undefined,
          sku: sku as string,
        },
        Number(page) || 1,
        Number(limit) || 10
      );
      res
        .status(200)
        .json(successResponse('Inventory history fetched', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  checkStock: async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        res
          .status(400)
          .json(errorResponse('Invalid input. Must provide a list of items.'));
        return;
      }
      const result = await inventoryService.checkStock(items);
      res.status(200).json(successResponse('Stock check completed', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default inventoryController;
