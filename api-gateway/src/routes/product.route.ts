import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';
import { requireAnyRole } from '../middleware/role.middleware';
import { UserRole } from '../enums/userRole.enum';

export default function productRoutes(app: Express) {
  const target = process.env.PRODUCT_SERVICE_URL!;
  // Websocket
  createServiceProxy(app, '/api/ws', target, {
    // Change noAuth to false in Prod
    noAuth: true,
    isWebSocket: true,
  });
  // Category routes
  createServiceProxy(app, '/api/category/all', target, { noAuth: true });
  createServiceProxy(app, '/api/category/create', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/category/details', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/category/update', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/category/toggle-status', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  // Product routes
  createServiceProxy(app, '/api/product/fetch', target, { noAuth: true });
  createServiceProxy(app, '/api/product/create', target, {
    noAuth: false,
  });
  createServiceProxy(app, '/api/product/details', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/product/details-by-slug', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/product/details-by-color-sku', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/product/update', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/product//update-size', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/product/toggle-status', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  // Review routes
  createServiceProxy(app, '/api/review/create', target, { noAuth: false });
  createServiceProxy(app, '/api/review/guest-create', target, { noAuth: true });
  createServiceProxy(app, '/api/review/product', target, { noAuth: true });
  createServiceProxy(app, '/api/review/details', target, { noAuth: true });
  createServiceProxy(app, '/api/review/update', target, { noAuth: false });
  createServiceProxy(app, '/api/review/deleted', target, { noAuth: false });
  // Inventory routes
  createServiceProxy(app, '/api/inventory/create', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/inventory/all', target, {
    noAuth: false,
    middlewares: [requireAnyRole(UserRole.ADMIN)],
  });
  createServiceProxy(app, '/api/inventory/check-stock', target, {
    noAuth: true,
  });
}
