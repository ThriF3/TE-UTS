import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthPayload } from '../types/index.js';

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): AuthPayload | null => {
  try {
    return jwt.decode(token) as AuthPayload | null;
  } catch {
    return null;
  }
};
