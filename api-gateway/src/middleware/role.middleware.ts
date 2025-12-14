import { RequestHandler } from 'express';
import { errorResponse } from '../utils/apiReponose.util';
import { UserRole } from '../enums/userRole.enum';

export const requireAnyRole = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json(errorResponse('Unauthorized'));
      return;
    }
    // Grant full access to ADMIN role regardless of specific permissions
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    if (!roles.includes(user.role)) {
      res
        .status(403)
        .json(
          errorResponse('You do not have permission to perform this action')
        );
      return;
    }

    next();
  };
};
