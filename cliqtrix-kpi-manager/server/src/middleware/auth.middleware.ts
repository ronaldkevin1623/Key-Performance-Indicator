
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt.config';
import { User } from '../models';
import logger from '../utils/logger';

// Extend Express Request type to include user
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

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided. Please login.',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'User no longer exists or is inactive.',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

/**
 * Check if user has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }

  next();
};

/**
 * Check if user has employee role
 */
export const requireEmployee = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'employee') {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Employee access only.',
    });
    return;
  }

  next();
};

/**
 * Check if user belongs to the same company
 */
export const checkCompanyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
      return;
    }

    // Get company ID from params or body
    const targetCompanyId = req.params.companyId || req.body.companyId;

    if (!targetCompanyId) {
      next();
      return;
    }

    // Check if user belongs to the same company
    if (req.user.companyId !== targetCompanyId) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your company data.',
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Company access check error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error checking company access.',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

export default {
  authenticate,
  requireAdmin,
  requireEmployee,
  checkCompanyAccess,
  optionalAuth,
};