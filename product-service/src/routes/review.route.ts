import { Router } from 'express';
import reviewController from '../controllers/review.controller';
import { sentimentMiddleware } from '../middlewares/sentimentGemini.middleware';

const router = Router();

router.post('/create', sentimentMiddleware, reviewController.create);
router.post('/guest-create', sentimentMiddleware, reviewController.create);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/details/:id', reviewController.getById);
router.put('/update/:id', reviewController.update);
router.delete('/deleted/:id', reviewController.delete);

export default router;
