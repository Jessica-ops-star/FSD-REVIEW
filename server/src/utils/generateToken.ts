import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'restaurant_platform_super_secret_jwt_key_2026_academic_project';
  return jwt.sign({ userId, role }, secret, { expiresIn: '7d' });
};
