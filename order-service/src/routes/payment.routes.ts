import { Router } from 'express';
import paymentController from '../controllers/payment.controller';

const router = Router();

router.post('/create', paymentController.create);
router.get('/fetch-admin', paymentController.getAll);
router.get('/fetch', paymentController.getMyPayments);
router.get('/details/:paymentId', paymentController.getById);
router.put('/update/:paymentId', paymentController.update);
router.get('/check-payment-vnpay', paymentController.checkPaymentWithVnpay);

export default router;
