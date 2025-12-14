import { Express, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { ProxyOptions } from '../interfaces/proxyOptions.interface';

export function createServiceProxy(
  app: Express,
  route: string,
  target: string,
  options: ProxyOptions = {}
) {
  const proxy = createProxyMiddleware({
    target: options.isWebSocket ? target : target + route,
    changeOrigin: true,
    selfHandleResponse: false,
    secure: false,
    pathRewrite: { [`^${route}`]: route },
    ws: options.isWebSocket || false,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const user = (req as any).user;
        if (user) {
          proxyReq.setHeader('X-User-Id', user.userId || '');
          proxyReq.setHeader('X-User-Role', user.role || '');
        }

        if (
          ['POST', 'PUT', 'PATCH'].includes((req as any).method) &&
          (req as any).body
        ) {
          const bodyData = JSON.stringify((req as any).body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
          proxyReq.end();
        }
      },
    },
  });

  const middlewares: RequestHandler[] = [];
  // Authentication
  if (!options.noAuth) {
    middlewares.push(authMiddleware(!!options.cookieStore, !!options.authAll));
  }

  // Authorization
  if (options.middlewares) {
    middlewares.push(...options.middlewares);
  }

  middlewares.push(proxy);
  app.use(route, ...middlewares);
}
