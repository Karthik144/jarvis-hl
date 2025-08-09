import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static readonly secret = process.env.JWT_SECRET!;

  static sign(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '7d'): string {
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  static verify(token: string): JWTPayload {
    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    try {
      return jwt.verify(token, this.secret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  static async verifyRequestToken(request: NextRequest): Promise<JWTPayload> {
    const token = this.extractTokenFromRequest(request);
    
    if (!token) {
      throw new Error('No token provided');
    }

    return this.verify(token);
  }
}

// Middleware helper for protected routes
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  try {
    return await JWTService.verifyRequestToken(request);
  } catch (error) {
    throw new Error('Authentication required');
  }
}
