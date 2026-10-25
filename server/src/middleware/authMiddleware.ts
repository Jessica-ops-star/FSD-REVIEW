import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'restaurant_platform_super_secret_jwt_key_2026_academic_project';
    const decoded = jwt.verify(token, secret) as { userId: string; role: UserRole };

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User account not found or deactivated' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token validation failed' });
    return;
  }
};

export const normalizeRole = (role: string): string => {
  if (role === 'RESTAURANT_ADMIN') return 'ADMIN';
  if (role === 'KITCHEN_STAFF') return 'KITCHEN';
  if (role === 'DELIVERY_PERSONNEL') return 'DELIVERY';
  return role;
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User unauthenticated' });
      return;
    }

    const userNormalized = normalizeRole(req.user.role);
    const normalizedAllowedRoles = roles.map((r) => normalizeRole(r));

    if (!normalizedAllowedRoles.includes(userNormalized) && !roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Current role: ${req.user.role}` 
      });
      return;
    }

    next();
  };
};
