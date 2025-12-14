import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';
import { requireAnyRole } from '../middleware/role.middleware';
import { UserRole } from '../enums/userRole.enum';

export default function userRoutes(app: Express) {
  const target = process.env.USER_SERVICE_URL!;
  // Address routes
  createServiceProxy(app, '/api/addresses/create', target, { noAuth: false });
  createServiceProxy(app, '/api/addresses/list', target, { noAuth: false });
  createServiceProxy(app, '/api/addresses/update', target, { noAuth: false });
  createServiceProxy(app, '/api/addresses/delete', target, { noAuth: false });
  createServiceProxy(app, '/api/addresses/set-default', target, {
    noAuth: false,
  });
  createServiceProxy(app, '/api/addresses/details', target, { noAuth: true });
  createServiceProxy(app, '/api/addresses/list-by-email', target, {
    noAuth: true,
  });
  // Auth routes
  createServiceProxy(app, '/api/auth/register', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/login', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/refresh-token', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/logout', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/change-password', target, {
    noAuth: false,
  });
  createServiceProxy(app, '/api/auth/set-password-social-login', target, {
    noAuth: false,
  });
  createServiceProxy(app, '/api/auth/reset-password', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/guest', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/send-email-reset-password', target, {
    noAuth: true,
  });
  // Google routes
  createServiceProxy(app, '/api/auth/google', target, { noAuth: true });
  createServiceProxy(app, '/api/auth/google/callback', target, {
    noAuth: true,
  });
  // Code routes
  createServiceProxy(app, '/api/codes/create', target, { noAuth: true });
  createServiceProxy(app, '/api/codes/verify', target, { noAuth: true });
  // Loyalty routes
  createServiceProxy(app, '/api/loyalty/add', target, { noAuth: false });
  createServiceProxy(app, '/api/loyalty/deduct', target, { noAuth: false });
  createServiceProxy(app, '/api/loyalty/history', target, { noAuth: false });
  // User routes
  createServiceProxy(app, '/api/users/me', target, { noAuth: false });
  createServiceProxy(app, '/api/users/update', target, { noAuth: false });
  createServiceProxy(app, '/api/users/all', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/users/user-details', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/users/update-by-admin', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/users/delete', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
}
