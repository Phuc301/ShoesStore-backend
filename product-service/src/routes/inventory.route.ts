import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';

const router = Router();

router.post('/create', inventoryController.create);
router.get('/all', inventoryController.getAll);
router.post('/check-stock', inventoryController.checkStock);

export default router;
