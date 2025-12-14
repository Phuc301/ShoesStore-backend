import { Express } from 'express';
import { createServiceProxy } from '../utils/proxy.util';

export default function userRoutes(app: Express) {
  const target = process.env.MEDIA_SERVICE_URL!;
  // File routes
  createServiceProxy(app, '/api/file/sync-avatar', target, { noAuth: false });
  createServiceProxy(app, '/api/file/sync-product', target, { noAuth: true });
  createServiceProxy(app, '/api/file/sync-variants', target, { noAuth: true });
}
