import { Router } from 'express';
import voucherController from '../controllers/voucher.controller';

const router = Router();

router.post('/create', voucherController.create);
router.get('/all', voucherController.getAll);
router.get('/details/:id', voucherController.getById);
router.put('/update/:id', voucherController.update);
router.patch('/toggle-status/:id', voucherController.toggleStatus);
router.post('/apply', voucherController.apply);
router.post('/cancel-apply', voucherController.cancelApply);
router.get('/usages', voucherController.getUsages);
router.get('/check-code-valid', voucherController.checkVoucherCodeValid);

export default router;
