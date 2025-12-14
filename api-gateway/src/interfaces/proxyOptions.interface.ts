import { RequestHandler } from 'express';

export interface ProxyOptions {
  middlewares?: RequestHandler[];
  noAuth?: boolean;
  cookieStore?: boolean;
  authAll?: boolean;
  isWebSocket?: boolean;
}
