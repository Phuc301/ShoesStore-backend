import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';
import { requireAnyRole } from '../middleware/role.middleware';
import { UserRole } from '../enums/userRole.enum';

export default function orderRoutes(app: Express) {
  const target = process.env.ORDER_SERVICE_URL!;
  // Order routes
  createServiceProxy(app, '/api/order/fetch', target, { noAuth: false });
  createServiceProxy(app, '/api/order/fetch-admin', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/details', target, { noAuth: false });
  createServiceProxy(app, '/api/order/create', target, { noAuth: false });
  createServiceProxy(app, '/api/order/create-by-guest', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/order/update', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/delete', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/status-count', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/best-selling', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/revenue', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/order/monthly-stats', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  // Payment
  createServiceProxy(app, '/api/payment/fetch', target, { noAuth: false });
  createServiceProxy(app, '/api/payment/fetch-admin', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/payment/details', target, { noAuth: true });
}
