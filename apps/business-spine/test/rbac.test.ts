/**
 * RBAC System Tests
 * Tests for role-based access control middleware and functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { rbacMiddleware, hasPermission, Role } from '@/src/rbac/middleware';

// Mock dependencies
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    }
  }
}));

// Mock next-auth/jwt module properly
const mockGetToken = vi.fn();
vi.doMock('next-auth/jwt', () => ({
  getToken: mockGetToken
}));

describe('RBAC Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should allow owner to access any resource', () => {
      expect(hasPermission(Role.OWNER, 'users', 'delete')).toBe(true);
      expect(hasPermission(Role.OWNER, 'payments', 'create')).toBe(true);
      expect(hasPermission(Role.OWNER, 'any-resource', 'any-action')).toBe(true);
    });

    it('should allow admin to access allowed resources', () => {
      expect(hasPermission(Role.ADMIN, 'users', 'read')).toBe(true);
      expect(hasPermission(Role.ADMIN, 'payments', 'update')).toBe(true);
      expect(hasPermission(Role.ADMIN, 'bookings', 'create')).toBe(true);
    });

    it('should deny admin to access owner-only resources', () => {
      expect(hasPermission(Role.ADMIN, 'users', 'delete')).toBe(false);
      expect(hasPermission(Role.ADMIN, 'system', 'delete')).toBe(false);
    });

    it('should allow manager to access management resources', () => {
      expect(hasPermission(Role.MANAGER, 'bookings', 'update')).toBe(true);
      expect(hasPermission(Role.MANAGER, 'staff', 'read')).toBe(true);
      expect(hasPermission(Role.MANAGER, 'schedules', 'create')).toBe(true);
    });

    it('should deny manager to access admin-only resources', () => {
      expect(hasPermission(Role.MANAGER, 'users', 'update')).toBe(false);
      expect(hasPermission(Role.MANAGER, 'payments', 'create')).toBe(false);
    });

    it('should allow staff to access basic resources', () => {
      expect(hasPermission(Role.STAFF, 'bookings', 'read')).toBe(true);
      expect(hasPermission(Role.STAFF, 'profile', 'update')).toBe(true);
    });

    it('should deny staff to access management resources', () => {
      expect(hasPermission(Role.STAFF, 'users', 'read')).toBe(false);
      expect(hasPermission(Role.STAFF, 'payments', 'create')).toBe(false);
    });

    it('should allow readonly to access reports only', () => {
      expect(hasPermission(Role.READONLY, 'reports', 'read')).toBe(true);
      expect(hasPermission(Role.READONLY, 'analytics', 'read')).toBe(true);
    });

    it('should deny readonly to access write operations', () => {
      expect(hasPermission(Role.READONLY, 'users', 'create')).toBe(false);
      expect(hasPermission(Role.READONLY, 'bookings', 'update')).toBe(false);
      expect(hasPermission(Role.READONLY, 'payments', 'delete')).toBe(false);
    });
  });

  describe('rbacMiddleware', () => {
    const mockRequest = (url: string = '/api/test') => {
      const req = new NextRequest(url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      });
      return req;
    };

    it('should return 401 when no token is provided', async () => {
      mockGetToken.mockResolvedValue(null);

      const request = mockRequest();
      const result = await rbacMiddleware(request, { resource: 'users', action: 'read' });

      expect(result?.status).toBe(401);
      const json = await result?.json();
      expect(json.error).toBe('Authentication required');
    });

    it('should return 401 when user is not found', async () => {
      mockGetToken.mockResolvedValue({ userId: 'user-123' });
      const { prisma } = await import('@/lib/prisma');

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = mockRequest();
      const result = await rbacMiddleware(request, { resource: 'users', action: 'read' });

      expect(result?.status).toBe(401);
      const json = await result?.json();
      expect(json.error).toBe('User not found');
    });

    it('should return 403 when user lacks permission', async () => {
      mockGetToken.mockResolvedValue({ userId: 'user-123' });
      const { prisma } = await import('@/lib/prisma');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed'
      });

      const request = mockRequest();
      const result = await rbacMiddleware(request, { resource: 'users', action: 'delete' });

      expect(result?.status).toBe(403);
      const json = await result?.json();
      expect(json.error).toBe('Insufficient permissions');

      // Should log unauthorized access attempt
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'UNAUTHORIZED_ACCESS',
          userId: 'user-123',
          metadata: expect.objectContaining({
            requiredPermission: { resource: 'users', action: 'delete' },
            userRole: 'staff'
          })
        })
      });
    });

    it('should return null when user has permission', async () => {
      mockGetToken.mockResolvedValue({ userId: 'user-123' });
      const { prisma } = await import('@/lib/prisma');

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-123',
        role: 'admin',
        email: 'admin@example.com',
        name: 'Test Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hashed'
      });

      const request = mockRequest();
      const result = await rbacMiddleware(request, { resource: 'users', action: 'read' });

      expect(result).toBe(null);
    });

    it('should handle errors gracefully', async () => {
      mockGetToken.mockRejectedValue(new Error('Token error'));

      const request = mockRequest();
      const result = await rbacMiddleware(request, { resource: 'users', action: 'read' });

      expect(result?.status).toBe(500);
      const json = await result?.json();
      expect(json.error).toBe('Internal server error');
    });
  });

  describe('Integration Tests', () => {
    it('should work with real API route structure', async () => {
      // This would test the actual API route integration
      // For now, we'll test the middleware behavior
      
      const mockHandler = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const { withRBAC } = await import('@/src/rbac/middleware');
      
      // Test successful authorization
      const { getToken } = await import('next-auth/jwt');
      const { prisma } = await import('@/lib/prisma');

      vi.mocked(getToken).mockResolvedValue({ userId: 'admin-123' });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'admin-123',
        role: 'admin',
        email: 'admin@example.com'
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET'
      });

      const wrappedHandler = withRBAC(mockHandler, { resource: 'users', action: 'read' });
      const result = await wrappedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(request);
    });
  });
});
