import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiReponose.util';
import codeService from '../services/code.service';
import { CodeType } from '../enums/codeType.enum';

const codeController = {
  // Generate code
  create: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { type } = req.body;
      const result = await codeService.createCode(userId, type as CodeType);
      res.status(201).json(successResponse('Code created', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Verify code
  verify: async (req: Request, res: Response) => {
    try {
      const { code, type } = req.query;
      const result = await codeService.verifyCode(
        code as string,
        type as CodeType
      );
      res.status(200).json(successResponse('Code verified', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default codeController;
