import { Router } from 'express';
import orderController from '../controllers/order.controller';

const router = Router();

router.get('/fetch-admin', orderController.getAll);
router.put('/update/:orderId', orderController.update);
router.delete('/delete/:orderId', orderController.remove);
router.get('/fetch', orderController.getMyOrders);
router.get('/details/:orderId', orderController.getById);
router.post('/create', orderController.create);
router.post('/create-by-guest', orderController.createByGuest);
router.get('/status-count', orderController.getStatusCount);
router.get('/best-selling', orderController.getBestSelling);
router.get('/revenue', orderController.getRevenue);
router.get('/monthly-stats', orderController.getMonthlyStats);

export default router;
