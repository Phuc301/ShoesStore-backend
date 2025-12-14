import { Router } from 'express';
import cartController from '../controllers/cart.controller';

const router = Router();

router.get('/by-user', cartController.getByUserId);
router.get('/by-session', cartController.getBySession);
router.post('/create', cartController.create);
router.delete('/clear/:cartId', cartController.clear);
router.patch('/merge', cartController.mergeSessionToUser);

export default router;
