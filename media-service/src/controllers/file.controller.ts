import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse.util';
import fileService from './../services/file.service';
import { UploadType } from '../enums/uploadType.enum';
import { redisPublisher } from '../core/redis.core';
import { RedisEvent } from '../enums/redisEvent.enum';

const fileController = {
  // Upload file(s)
  upload: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const files = req.files as Express.Multer.File[];
      const { uploadType, productId } = req.body;

      if (!files || files.length === 0) throw new Error('No files uploaded');

      const urls = await fileService.uploadFiles(
        userId,
        files,
        uploadType as UploadType,
        productId
      );
      res
        .status(201)
        .json(successResponse('File(s) uploaded successfully', { urls }));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Delete file(s) by URL
  delete: async (req: Request, res: Response) => {
    try {
      const { publicUrls, uploadType } = req.body;
      if (!publicUrls) throw new Error('No publicUrl provided');

      const data = await fileService.deleteFiles(publicUrls, uploadType);
      res
        .status(200)
        .json(successResponse('File(s) deleted successfully', data));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Sync file(s)
  syncProduct: async (req: Request, res: Response) => {
    try {
      const { uploadType, productId } = req.body;

      if (!uploadType) {
        res.status(400).json(errorResponse('Invalid upload type'));
        return;
      }

      // File delete
      const toDelete = Array.isArray(req.body.toDelete)
        ? req.body.toDelete
        : req.body.toDelete
          ? [req.body.toDelete]
          : [];

      const toAdd: Express.Multer.File[] =
        (req.files as Express.Multer.File[]) || [];

      const result = await fileService.syncFiles(
        uploadType,
        toDelete,
        toAdd,
        undefined,
        productId
      );

      await redisPublisher.publish(
        RedisEvent.UPLOAD_PRODUCT_IMAGE,
        JSON.stringify({
          productId,
          result,
        })
      );

      res
        .status(200)
        .json(successResponse('Sync completed successfully', { result }));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
    }
  },
  syncAvatar: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.headers['x-user-id']);
      const { uploadType } = req.body;
      if (!userId) {
        res.status(400).json(errorResponse('Missing user ID in headers'));
        return;
      }
      if (!uploadType) {
        res.status(400).json(errorResponse('Invalid upload type'));
        return;
      }
      // File delete
      const toDelete = Array.isArray(req.body.toDelete)
        ? req.body.toDelete
        : req.body.toDelete
          ? [req.body.toDelete]
          : [];
      const toAdd: Express.Multer.File[] =
        (req.files as Express.Multer.File[]) || [];

      const result = await fileService.syncFiles(
        uploadType,
        toDelete,
        toAdd,
        userId,
        undefined
      );
      // Notify to user-service to update avatar URL
      await redisPublisher.publish(
        RedisEvent.UPLOAD_URL,
        JSON.stringify({
          userId,
          data: result,
        })
      );
      res
        .status(200)
        .json(successResponse('Sync completed successfully', { result }));
    } catch (error: any) {
      res.status(500).json(errorResponse(error.message));
    }
  },
  syncVariants: async (req: Request, res: Response) => {
    try {
      const { uploadType, productId } = req.body;
      if (uploadType !== UploadType.VARIANTS) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid upload type' });
      }
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing productId' });
      }
      // File delete
      const toDelete = Array.isArray(req.body.toDelete)
        ? req.body.toDelete
        : req.body.toDelete
          ? [req.body.toDelete]
          : [];
      // Get files
      const files = (req.files as Express.Multer.File[]) || [];
      // Map files theo slug
      const variantFilesMap: Record<string, Express.Multer.File[]> = {};
      files.forEach((file) => {
        const match = file.fieldname.match(/variantFiles\[(.+?)\]\[\]/);
        if (match) {
          const slug = match[1];
          if (!variantFilesMap[slug]) variantFilesMap[slug] = [];
          variantFilesMap[slug].push(file);
        }
      });
      // Delete old files
      let deleted: string[] = [];
      let failedDelete: string[] = [];
      if (toDelete.length > 0) {
        try {
          const deleteResult = await fileService.deleteFiles(
            toDelete,
            UploadType.VARIANTS
          );
          deleted = deleteResult.success;
          failedDelete = deleteResult.failed;
        } catch {
          failedDelete = toDelete;
        }
      }
      const result = await fileService.uploadVariantFilesMap({
        variantFilesMap,
        uploadType: UploadType.VARIANTS,
        productId: Number(productId),
      });

      await redisPublisher.publish(
        RedisEvent.UPLOAD_PRODUCT_VARIANTS,
        JSON.stringify({
          productId,
          result,
        })
      );
      res.status(200).json({
        success: true,
        message: 'Sync completed successfully',
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default fileController;
