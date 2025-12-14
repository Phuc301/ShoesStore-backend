import { Request, Response } from 'express';
import orderService from '../services/order.service';
import { successResponse, errorResponse } from '../utils/apiResponse.util';
import { OrderStatus } from '../enums/orderStatus.enum';

const orderController = {
  // Create order
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { orderData, items, paymenMethod, cartId } = req.body;
      const order = await orderService.createOrder(
        { ...orderData, userId },
        items,
        cartId,
        paymenMethod
      );
      res.status(201).json(successResponse('Order created', order));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Create order with guest
  createByGuest: async (req: Request, res: Response) => {
    try {
      const { orderData, items, paymenMethod, guestInfo, addressInfo, cartId } =
        req.body;
      const order = await orderService.createOrderByGuest(
        { ...orderData },
        items,
        guestInfo,
        addressInfo,
        cartId,
        paymenMethod
      );
      res.status(201).json(successResponse('Order created', order));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all orders (admin)
  getAll: async (req: Request, res: Response) => {
    try {
      const { status, userId, page, limit, dateFilter, startDate, endDate, applyVoucher, voucherId } =
        req.query;

      const result = await orderService.getOrders({
        status: status as OrderStatus,
        userId: userId ? Number(userId) : undefined,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        dateFilter: dateFilter as
          | 'today'
          | 'yesterday'
          | 'thisWeek'
          | 'thisMonth'
          | 'range',
        startDate: startDate as string,
        endDate: endDate as string,
        applyVoucher: applyVoucher === 'true',
        voucherId: voucherId as string,
      });

      res.json(successResponse('Orders fetched for admin', result));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  // Get my orders
  getMyOrders: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.header('X-User-Id'));
      if (!userId) throw new Error('User ID missing');
      const { status, page, limit } = req.query;
      const result = await orderService.getOrders({
        status: status as OrderStatus,
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      res.json(successResponse('User orders fetched', result));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  // Get order by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);
      res.json(successResponse('Order fetched', order));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update order
  update: async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const updates = req.body;
      const order = await orderService.updateOrder(orderId, updates);
      res.json(successResponse('Order updated', order));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Delete order
  remove: async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const result = await orderService.deleteOrder(orderId);
      res.json(successResponse('Order deleted', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get order count by status
  getStatusCount: async (req: Request, res: Response) => {
    try {
      const data = await orderService.getOrderStatusCount();
      res.json(successResponse('Order status count fetched', data));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  // Get best selling products
  getBestSelling: async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 5;
      const data = await orderService.getBestSellingProducts(limit);
      res.json(successResponse('Best-selling products fetched', data));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  getRevenue: async (req: Request, res: Response) => {
    try {
      const { statuses, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json(errorResponse('startDate and endDate are required'));
      }

      const statusEnums: OrderStatus[] = statuses
        ? (statuses as string).split(',').map((s) => s.trim() as OrderStatus)
        : [OrderStatus.DELIVERED];

      const revenueData = await orderService.getRevenueByStatusAndDate({
        statuses: statusEnums,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(successResponse('Revenue data fetched', revenueData));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },

  getMonthlyStats: async (req: Request, res: Response) => {
    try {
      const data = await orderService.getMonthlyStats();
      res.json({
        success: true,
        message: 'Monthly stats fetched',
        data,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },
};

export default orderController;
