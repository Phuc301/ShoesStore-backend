import cloudinary from '../core/cloudinaryConfig.core';
import streamifier from 'streamifier';
import path from 'path';
import { UploadType } from '../enums/uploadType.enum';

const _generateFileName = (
  uploadType: UploadType,
  userId?: number,
  productId?: number,
  variantSku?: string,
  originalName?: string
): string => {
  const timestamp = Date.now();
  let base = '';

  switch (uploadType) {
    case UploadType.AVATAR:
      base = `avatar_${userId}_${timestamp}`;
      break;
    case UploadType.PRODUCT:
      base = `product_${productId}_${timestamp}`;
      break;
    case UploadType.VARIANTS:
      base = `variants_${variantSku}_${timestamp}`;
      break;
    default:
      base = `file_${timestamp}`;
  }
  const ext = originalName ? path.extname(originalName) || '.jpg' : '.jpg';
  return `${base}${ext}`;
};
const fileService = {
  // Upload single file
  uploadFile: async (
    file: Express.Multer.File,
    uploadType: UploadType,
    userId?: number,
    productId?: number,
    variantSku?: string
  ): Promise<string> => {
    if (!file) throw new Error('No file provided');

    const fileName = _generateFileName(
      uploadType,
      userId,
      productId,
      variantSku,
      file.originalname
    );

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadType,
          public_id: fileName.replace(path.extname(fileName), ''),
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  },
  // Upload multiple file
  uploadFiles: async (
    userId: number,
    files: Express.Multer.File[],
    uploadType: UploadType,
    productId: number
  ): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const urls = await Promise.all(
      files.map((file) =>
        fileService.uploadFile(file, uploadType, userId, productId)
      )
    );
    return urls;
  },
  // Delete file
  deleteFile: async (
    publicUrl: string,
    uploadType: UploadType
  ): Promise<void> => {
    if (!publicUrl) return;

    try {
      const url = new URL(publicUrl);
      const parts = url.pathname.split('/');

      const folderIndex = parts.findIndex((p) => p === uploadType);
      if (folderIndex === -1) {
        // throw new Error('Invalid folder type in URL');
        return;
      }

      const publicId = parts
        .slice(folderIndex)
        .join('/')
        .replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId);
    } catch (err: any) {
      throw new Error(`Remove file failed: ${err.message}`);
    }
  },
  // Delete mutil file
  deleteFiles: async (
    publicUrls: string[],
    uploadType: UploadType
  ): Promise<{ success: string[]; failed: string[] }> => {
    if (!publicUrls || publicUrls.length === 0)
      return { success: [], failed: [] };
    const results = await Promise.allSettled(
      publicUrls.map((url) => {
        fileService.deleteFile(url, uploadType);
      })
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        success.push(publicUrls[i]);
      } else {
        failed.push(publicUrls[i]);
      }
    });

    return { success, failed };
  },
  // Sync file
  syncFiles: async (
    uploadType: UploadType,
    toDelete: string[],
    toAdd: Express.Multer.File[],
    userId?: number,
    productId?: number
  ): Promise<{
    added: string[];
    failedAdd: string[];
    deleted: string[];
    failedDelete: string[];
  }> => {
    let deleted: string[] = [];
    let failedDelete: string[] = [];
    try {
      const result = await fileService.deleteFiles(toDelete, uploadType);
      deleted = result.success;
      failedDelete = result.failed;
    } catch {
      failedDelete = toDelete;
    }

    // Add file(s)
    const addResults = await Promise.allSettled(
      toAdd.map((file) =>
        fileService.uploadFile(file, uploadType, userId, productId)
      )
    );
    const added: string[] = [];
    const failedAdd: string[] = [];
    addResults.forEach((r, i) => {
      if (r.status === 'fulfilled') added.push(r.value);
      else failedAdd.push(toAdd[i].originalname);
    });
    return { added, failedAdd, deleted, failedDelete };
  },
  uploadVariantFilesMap: async ({
    variantFilesMap,
    uploadType,
    productId,
  }: {
    variantFilesMap: Record<string, Express.Multer.File[]>;
    uploadType: UploadType;
    userId?: number;
    productId?: number;
  }) => {
    const result: Record<string, { added: string[]; failedAdd: string[] }> = {};

    for (const [variantSku, files] of Object.entries(variantFilesMap)) {
      const added: string[] = [];
      const failedAdd: string[] = [];
      const uploads = await Promise.allSettled(
        files.map((file) =>
          fileService.uploadFile(
            file,
            uploadType,
            undefined,
            productId,
            variantSku
          )
        )
      );

      uploads.forEach((r, i) => {
        if (r.status === 'fulfilled') added.push(r.value);
        else failedAdd.push(files[i].originalname);
      });

      result[variantSku] = { added, failedAdd };
    }

    return result;
  },
};

export default fileService;
