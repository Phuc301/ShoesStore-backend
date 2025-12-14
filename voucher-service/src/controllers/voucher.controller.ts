import { Request, Response } from 'express';
import voucherService from '../services/voucher.service';
import { successResponse, errorResponse } from '../utils/apiReponose.util';

const voucherController = {
  // Create voucher
  create: async (req: Request, res: Response) => {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      res.status(201).json(successResponse('Voucher created', voucher));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get all vouchers
  getAll: async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        noPage = false,
        isActive = true,
        isShowAll = false,
      } = req.query;
      const vouchers = await voucherService.getAllVouchers(
        Number(page),
        Number(limit),
        noPage === 'true',
        isActive === 'true',
        isShowAll === 'true'
      );
      res.status(200).json(successResponse('Vouchers fetched', vouchers));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get voucher by ID
  getById: async (req: Request, res: Response) => {
    try {
      const voucherId = Number(req.params.id);
      const voucher = await voucherService.getVoucherById(voucherId);
      res.status(200).json(successResponse('Voucher fetched', voucher));
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Update voucher
  update: async (req: Request, res: Response) => {
    try {
      const voucherId = Number(req.params.id);
      const voucher = await voucherService.updateVoucher(voucherId, req.body);
      res.status(200).json(successResponse('Voucher updated', voucher));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Toggle voucher status
  toggleStatus: async (req: Request, res: Response) => {
    try {
      const voucherId = Number(req.params.id);
      const voucher = await voucherService.toggleVoucherStatus(voucherId);
      res
        .status(200)
        .json(
          successResponse(
            voucher.isActive ? 'Voucher activated' : 'Voucher deactivated',
            voucher
          )
        );
    } catch (err: any) {
      res.status(404).json(errorResponse(err.message));
    }
  },
  // Apply voucher
  apply: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { code, orderTotal, orderId } = req.body;
      const result = await voucherService.applyVoucher(
        code,
        orderTotal,
        userId,
        orderId
      );
      res.status(200).json(successResponse('Voucher applied', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Cancel apply (if needed)
  cancelApply: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { orderId } = req.body;

      const result = await voucherService.cancelVoucher(orderId, userId);

      res.status(200).json(successResponse(result.message, result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Get voucher usages
  getUsages: async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const usages = await voucherService.getVoucherUsages(userId);
      res.status(200).json(successResponse('Voucher usages fetched', usages));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // check voucher code valid 
  checkVoucherCodeValid: async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      const result = await voucherService.checkVoucherCodeValid(code as string);
      res.status(200).json(successResponse('Voucher code valid', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  }
};

export default voucherController;
