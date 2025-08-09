// API utility functions and helpers

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiResponse } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiResponse<T>(
  data?: T,
  message?: string,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: statusCode }
  );
}

export function createApiError(
  error: string | Error,
  statusCode: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return createApiError(error.message, error.statusCode, error.code);
  }

  if (error instanceof ZodError) {
    return createApiError(
      `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  if (error instanceof Error) {
    return createApiError(error.message, 500);
  }

  return createApiError('An unexpected error occurred', 500);
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const result = await handler();
    return createApiResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// Rate limiting helpers (in-memory, use Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Request logging
export function logApiRequest(
  method: string,
  url: string,
  ip?: string,
  userAgent?: string
): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
}

// CORS headers
export function corsHeaders(): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return headers;
}

// Pagination helpers
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export function parsePagination(
  searchParams: URLSearchParams,
  options: PaginationOptions = {}
): { page: number; limit: number; skip: number } {
  const { maxLimit = 100 } = options;
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get('limit') || '10'))
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
