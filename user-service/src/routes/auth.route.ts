import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);
router.post('/reset-password', authController.resetPassword);
router.post('/find-or-register', authController.findOrRegisterGuest);
// Google OAuth
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.post(
  '/set-password-social-login',
  authController.setPasswordForSocialLogin
);
router.post('/send-email-reset-password', authController.sendResetPasswordCode);
export default router;
