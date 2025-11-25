import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { User } from '../models';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'admin' | 'employee';
        companyId: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'No token provided. Please login.' });
      return;
    }
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ status: 'error', message: 'User no longer exists or is inactive.' });
      return;
    }

    // Now companyId should always be a string!
    let companyId: string = "";
    if (typeof decoded.companyId === "string") {
      companyId = decoded.companyId;
    } else if (typeof decoded.companyId === "object" && decoded.companyId !== null) {
      // If old token; fallback
      const obj = decoded.companyId as { _id?: string; id?: string };
      if (obj._id && typeof obj._id === "string") companyId = obj._id;
      else if (obj.id && typeof obj.id === "string") companyId = obj.id;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      companyId, // always plain string
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({ status: 'error', message: 'Invalid or expired token. Please login again.' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ status: 'error', message: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ status: 'error', message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};

// Other middleware (employee, company access...) same as before

export default {
  authenticate,
  requireAdmin,
  // ...others...
};
