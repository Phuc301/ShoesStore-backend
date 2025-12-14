import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.get('/me', userController.getProfile);
router.put('/update', userController.updateProfile);
router.post('/info-list', userController.getPublicInfoList);
// Admin only
router.get('/all', userController.listUsers);
router.get('/user-details/:userId', userController.getUserDetails);
router.put('/update-by-admin/:userId', userController.updateProfileUserByAdmin);
router.delete('/delete/:userId', userController.deleteUser);
router.get('/stats', userController.getStats);

export default router;
