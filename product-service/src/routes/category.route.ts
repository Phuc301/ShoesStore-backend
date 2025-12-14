import { Router } from 'express';
import categoryController from '../controllers/category.controller';

const router = Router();

router.post('/create', categoryController.create);
router.get('/all', categoryController.getAll);
router.get('/details/:id', categoryController.getById);
router.put('/update/:id', categoryController.update);
router.patch('/toggle-status/:id', categoryController.toggleStatus);

export default router;
