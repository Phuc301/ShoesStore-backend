import { Request, Response } from 'express';
import passport from 'passport';
import { errorResponse, successResponse } from '../utils/apiReponose.util';
import authService from '../services/auth.service';

const authController = {
  // Register
  register: async (req: Request, res: Response) => {
    const { fullName, email, password, role } = req.body;
    try {
      const account = await authService.register(
        fullName,
        email,
        password,
        role
      );
      res.status(201).json(successResponse('Register successful', account));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Login
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const tokens = await authService.login(email, password);
      res.status(200).json(successResponse('Login successful', tokens));
    } catch (err: any) {
      res.status(401).json(errorResponse(err.message));
    }
  },
  // Refresh token
  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
      const tokens = await authService.refreshToken(refreshToken);
      res
        .status(200)
        .json(successResponse('Token refreshed successfully', tokens));
    } catch (err: any) {
      res.status(403).json(errorResponse(err.message));
    }
  },
  // Logout
  logout: async (req: Request, res: Response) => {
    const { accessToken, refreshToken } = req.body;
    try {
      await authService.logout(accessToken, refreshToken);
      res.status(200).json(successResponse('Logout successful'));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Change password
  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.header('X-User-Id'));
      const { oldPassword, newPassword } = req.body;

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );
      res.status(200).json(successResponse('Password changed', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Reset password
  resetPassword: async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    try {
      const result = await authService.resetPassword(email, newPassword);
      res.status(200).json(successResponse('Password reset', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Check and create guest account
  findOrRegisterGuest: async (req: Request, res: Response) => {
    const { guestInfo, addressInfo } = req.body;
    try {
      const user = await authService.findOrRegisterGuest(
        guestInfo,
        addressInfo
      );
      res.status(200).json(successResponse('Guest account created', user));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  googleLogin: passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
  // Google callback - Google OAuth
  googleCallback: (req: Request, res: Response, next: any) => {
    passport.authenticate('google', async (err: any, profile: any) => {
      if (err) return res.status(400).json(errorResponse(err.message));
      try {
        const tokens = await authService.loginWithGoogle(profile);
        res.send(`
        <html>
          <body>
            <script>
              const data = ${JSON.stringify(tokens)};
              window.opener.postMessage(data, "${process.env.CLIENT_URL}");
              window.close();
            </script>
          </body>
        </html>
      `);
      } catch (err: any) {
        res.status(400).json(errorResponse(err.message));
      }
    })(req, res, next);
  },
  // Update password for OAuth users
  setPasswordForSocialLogin: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.header('X-User-Id'));
      const { newPassword } = req.body;
      const result = await authService.setPasswordForSocialLogin(
        userId,
        newPassword
      );
      res.status(200).json(successResponse('Password updated', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
  // Sent reset password code to email
  sendResetPasswordCode: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) throw new Error('Email is required');
      const result = await authService.sendResetPasswordCode(email);
      res
        .status(200)
        .json(successResponse('Email verification code sent', result));
    } catch (err: any) {
      res.status(400).json(errorResponse(err.message));
    }
  },
};

export default authController;
