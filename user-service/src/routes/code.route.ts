import { Router } from 'express';
import codeController from '../controllers/code.controller';

const router = Router();

router.post('/create', codeController.create);
router.get('/verify', codeController.verify);

export default router;
