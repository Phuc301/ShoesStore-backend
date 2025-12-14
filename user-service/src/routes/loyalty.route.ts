import { Router } from 'express';
import loyaltyController from '../controllers/loyalty.controller';

const router = Router();

router.post('/add', loyaltyController.addPoints);
router.post('/deduct', loyaltyController.deductPoints);
router.get('/history', loyaltyController.getHistory);

export default router;
