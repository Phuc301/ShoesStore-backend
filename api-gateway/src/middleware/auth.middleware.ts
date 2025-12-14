import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/apiReponose.util';
import { v4 as uuidv4 } from 'uuid';

export const authMiddleware =
  (cookieStore: boolean, authAll: boolean): RequestHandler =>
  (req, res, next): void => {
    const authHeader = req.headers.authorization;
    // let sessionId = req.cookies.sessionId;
    let sessionId = null;
    // Both token and sessionId are required
    if (authAll) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(errorResponse('Missing access token'));
        return;
      }

      sessionId = req.headers['x-session-id'] as string | undefined;

      // if (!sessionId) {
      //   res.status(401).json(errorResponse('Missing session cookie'));
      //   return;
      // }
    }
    // No token provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (cookieStore) {
        if (!sessionId) {
          sessionId = uuidv4();
          res.cookie('sessionId', sessionId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: process.env.COOKIE_MAX_AGE
              ? parseInt(process.env.COOKIE_MAX_AGE)
              : 0,
          });
        }
        req.headers['x-session-id'] = sessionId;
        return next();
      }
      res.status(401).json(errorResponse('No token provided'));
      return;
    }
    // Validate token
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      (req as any).user = decoded;

      // Handle session cookie
      if (authAll && cookieStore) {
        req.headers['x-session-id'] = sessionId! || '';
      }
      return next();
    } catch (err) {
      res.status(401).json(errorResponse('Invalid or expired token'));
      return;
    }
  };
