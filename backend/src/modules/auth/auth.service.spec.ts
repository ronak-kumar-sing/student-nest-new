import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { Role } from '@prisma/client';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcryptjs from 'bcryptjs';

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtMock: any;
  let configMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    jwtMock = {
      signAsync: vi.fn().mockImplementation(async (payload, options) => {
        if (options?.secret === 'refresh_secret_test') {
          return `mock_refresh_token_for_${payload.sub}`;
        }
        return `mock_access_token_for_${payload.sub}`;
      }),
      verifyAsync: vi.fn(),
    };

    configMock = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: string) => {
        const map: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access_secret_test_16_chars',
          JWT_REFRESH_SECRET: 'refresh_secret_test',
          JWT_ACCESS_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return map[key] || defaultValue;
      }),
    };

    notificationsMock = {
      send: vi.fn().mockResolvedValue({ delivered: true }),
    };

    authService = new AuthService(
      prismaMock,
      jwtMock,
      configMock,
      notificationsMock,
    );
  });

  describe('signup', () => {
    it('should create a new user, student profile, generate tokens and notify', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'student@example.com',
        role: Role.STUDENT,
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const res = await authService.signup({
        email: 'student@example.com',
        password: 'Password123!',
        role: Role.STUDENT,
        fullName: 'Rahul Sharma',
      });

      expect(res.user.id).toBe('user-uuid-1');
      expect(res.user.email).toBe('student@example.com');
      expect(res.tokens.accessToken).toBeDefined();
      expect(res.tokens.refreshToken).toBeDefined();

      // Ensure password hashing was called
      expect(prismaMock.user.create).toHaveBeenCalled();
      const createCall = prismaMock.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('student@example.com');
      expect(createCall.data.passwordHash).not.toBe('Password123!');

      // Ensure refresh token was saved in DB
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();

      // Ensure email verification notification was triggered
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'EMAIL_VERIFICATION',
          recipient: 'student@example.com',
        }),
      );
    });

    it('should throw ConflictException if email already registered', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        authService.signup({
          email: 'duplicate@example.com',
          password: 'Password123!',
          role: Role.STUDENT,
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens when credentials match', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'student@example.com',
        passwordHash,
        role: Role.STUDENT,
        isEmailVerified: true,
        createdAt: new Date(),
        studentProfile: { fullName: 'Rahul Sharma' },
      });

      const res = await authService.login({
        email: 'student@example.com',
        password: 'Password123!',
      });

      expect(res.user.email).toBe('student@example.com');
      expect(res.tokens.accessToken).toBeDefined();
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const passwordHash = await bcryptjs.hash('RealPassword!', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'student@example.com',
        passwordHash,
        role: Role.STUDENT,
      });

      await expect(
        authService.login({
          email: 'student@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens: delete old token from DB and store new hashed token', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        email: 'student@example.com',
        role: Role.STUDENT,
      });

      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-db-id',
        userId: 'user-uuid-1',
        expiresAt: futureDate,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'student@example.com',
        role: Role.STUDENT,
      });

      const tokens = await authService.refreshTokens('valid_refresh_token');

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      // Old token deleted
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-db-id' },
      });
      // New token saved
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    });

    it('should reject when refresh token is revoked or expired', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sub: 'user-uuid-1' });
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshTokens('unknown_or_expired_token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
