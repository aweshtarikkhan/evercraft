import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'evercraft_super_secret_key_2026';

export interface AuthUser {
  id: number;
  email: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Unauthorized: Invalid or expired token' });
  }
}

// RLS Check Middleware
// Requires verifyToken to be called first
export function rlsCheck(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ detail: 'Unauthorized' });
  }

  // Admin bypass
  if (req.user.role === 'Master Admin' || req.user.role === 'Developer' || req.user.role === 'Admin') {
    return next();
  }

  const requestedUserId = parseInt(req.params.user_id);
  if (!isNaN(requestedUserId) && req.user.id !== requestedUserId) {
    return res.status(403).json({ detail: 'Forbidden: You do not have permission to access this resource' });
  }

  next();
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ detail: 'Unauthorized' });
  }
  if (req.user.role === 'Master Admin' || req.user.role === 'Developer' || req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ detail: 'Forbidden: Admin access required' });
}
