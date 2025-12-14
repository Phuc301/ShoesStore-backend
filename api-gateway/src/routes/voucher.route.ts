import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';
import { requireAnyRole } from '../middleware/role.middleware';
import { UserRole } from '../enums/userRole.enum';

export default function voucherRoutes(app: Express) {
  const target = process.env.VOUCHER_SERVICE_URL!;
  // Voucher routes
  createServiceProxy(app, '/api/voucher/all', target, { noAuth: true });
  createServiceProxy(app, '/api/voucher/create', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/voucher/details', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/voucher/update', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/voucher/toggle-status', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/voucher/apply', target, { noAuth: true });
  createServiceProxy(app, '/api/voucher/cancel-apply', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/voucher/usages', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/voucher/check-code-valid', target, {
    noAuth: true,
  });
}
