import { Router } from 'express';
import productController from '../controllers/product.controller';

const router = Router();

router.post('/create', productController.create);
router.get('/fetch', productController.getAll);
router.get('/details/:id', productController.getById);
router.get('/details-by-slug/:slug', productController.getProductBySlug);
router.get(
  '/details-by-color-sku/:sku',
  productController.getProductByColorSku
);
router.post('/by-skus', productController.getProductsBySkus);
router.put('/update/:id', productController.update);
router.put('/update-size/:sku', productController.updateProductBySizeSku);
router.patch('/toggle-status/:id', productController.toggleStatus);
router.post('/by-ids', productController.getProductsByIds);

export default router;
