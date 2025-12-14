import { Router } from 'express';
import cartItemController from '../controllers/cartItem.controller';

const router = Router();

router.get('/get/:cartId', cartItemController.getByCart);
router.get('/count/:cartId', cartItemController.getByCartCount);
router.post('/add/:cartId', cartItemController.add);
router.put('/update/:id', cartItemController.update);
router.delete('/remove/:id', cartItemController.remove);

export default router;
