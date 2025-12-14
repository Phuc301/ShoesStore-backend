import { Router } from 'express';
import multer from 'multer';
import fileController from '../controllers/file.controller';

const router = Router();
const upload = multer();

router.post('/upload', upload.array('files', 5), fileController.upload);
router.post(
  '/sync-avatar',
  upload.array('avatar', 1),
  fileController.syncAvatar
);
router.post(
  '/sync-product',
  upload.array('product', 1),
  fileController.syncProduct
);
router.post(
  '/sync-variants',
  upload.any(),
  fileController.syncVariants
);
router.delete('/delete', fileController.delete);

export default router;
