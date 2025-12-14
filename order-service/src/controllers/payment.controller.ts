import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import { successResponse, errorResponse } from '../utils/apiResponse.util';
import { PaymentTransactionType } from '../enums/paymentTransactionType.enum';
import vnpayService from '../services/vnpay.service';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import { PaymentMethod } from '../enums/paymentMethod.ennum';

const paymentController = {
  // Create payment
  create: async (req: Request, res: Response) => {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json(successResponse('Payment created', payment));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all payments
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const status = req.query.status as string | undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await paymentService.getPayments(
        userId,
        status,
        page,
        limit
      );

      res.json(successResponse('Payments fetched for admin', result));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  // Get my payments
  getMyPayments: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.header('X-User-Id'));
      if (!userId) throw new Error('User ID missing');

      const status = req.query.status as string | undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await paymentService.getPayments(
        userId,
        status,
        page,
        limit
      );

      res.json(successResponse('User payments fetched', result));
    } catch (err: any) {
      res.status(500).json(errorResponse(err.message));
    }
  },
  // Get payment by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const payment = await paymentService.getPaymentById(Number(paymentId));
      res.json(successResponse('Payment fetched', payment));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update payment
  update: async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const updates = req.body;
      const payment = await paymentService.updatePayment(
        Number(paymentId),
        updates
      );
      res.json(successResponse('Payment updated', payment));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  //  Check payment with VnPay
  checkPaymentWithVnpay: async (req: Request, res: Response) => {
    try {
      const result = await vnpayService.checkPayment(req.query);

      let orderId: string | undefined;
      const vnp_OrderInfo = req.query.vnp_OrderInfo;
      if (typeof vnp_OrderInfo === 'string') {
        try {
          const parsed = JSON.parse(vnp_OrderInfo);
          orderId = parsed.orderId;
        } catch {}
      }
      if (result.status === PaymentStatus.SUCCESS) {
        const successUrl = new URL(process.env.PAYMENT_SUCCESS_REDIRECT_URL!);
        successUrl.searchParams.set('paymentMethod', PaymentMethod.VNPAY);
        if (orderId) successUrl.searchParams.set('orderId', String(orderId));
        return res.redirect(302, successUrl.toString());
      } else {
        const failedUrl = new URL(process.env.PAYMENT_FAILED_REDIRECT_URL!);
        failedUrl.searchParams.set('errorType', 'payment');
        return res.redirect(302, failedUrl.toString());
      }
    } catch (err: any) {
      console.error('Error in checkPayment:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'Payment check failed',
      });
    }
  },
};

export default paymentController;
