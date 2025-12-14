import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';

export default function cartRoutes(app: Express) {
  const target = process.env.CART_SERVICE_URL!;
  // Cart routes
  createServiceProxy(app, '/api/cart/by-user', target, { noAuth: false });
  createServiceProxy(app, '/api/cart/by-session', target, {
    noAuth: true,
  });
  createServiceProxy(app, '/api/cart/merge', target, {
    noAuth: false,
    cookieStore: true,
    authAll: true,
  });
  createServiceProxy(app, '/api/cart/create', target, {
    noAuth: false,
    cookieStore: true,
  });
  createServiceProxy(app, '/api/cart/clear', target, { noAuth: true });
  // Cart Items routes
  createServiceProxy(app, '/api/cart-item/get', target, { noAuth: true });
  createServiceProxy(app, '/api/cart-item/count', target, { noAuth: true });
  createServiceProxy(app, '/api/cart-item/add', target, { noAuth: true });
  createServiceProxy(app, '/api/cart-item/update', target, { noAuth: true });
  createServiceProxy(app, '/api/cart-item/remove', target, { noAuth: true });
}
