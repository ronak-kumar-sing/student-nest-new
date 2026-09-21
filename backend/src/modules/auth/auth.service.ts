import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcryptjs from 'bcryptjs';
import crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Role } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SanitizedUser {
  id: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  fullName?: string;
  createdAt: Date;
}

export interface InMemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  fullName: string;
  phone?: string;
  collegeName?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isAadhaarVerified: boolean;
  createdAt: Date;
}

export const IN_MEMORY_USERS = new Map<string, InMemoryUser>();

// Pre-seed the 3 dedicated demo accounts
function seedDemoUsers() {
  const hashPass = bcryptjs.hashSync('Password123!', 10);
  const hashAdminPass = bcryptjs.hashSync('AdminPassword123!', 10);

  // 1. Student Demo: Julian Chen
  IN_MEMORY_USERS.set('student@studentnest.demo', {
    id: 'usr-student-demo',
    email: 'student@studentnest.demo',
    passwordHash: hashPass,
    role: Role.STUDENT,
    fullName: 'Julian Chen',
    phone: '+16175550192',
    collegeName: 'Harvard Graduate School',
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    createdAt: new Date(),
  });

  // 2. Owner Demo: Eleanor Vance
  IN_MEMORY_USERS.set('owner@studentnest.demo', {
    id: 'usr-owner-demo',
    email: 'owner@studentnest.demo',
    passwordHash: hashPass,
    role: Role.OWNER,
    fullName: 'Eleanor Vance',
    phone: '+16175550144',
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    createdAt: new Date(),
  });

  // 3. Admin Demo: Chief Moderator
  IN_MEMORY_USERS.set('admin@studentnest.demo', {
    id: 'usr-admin-demo',
    email: 'admin@studentnest.demo',
    passwordHash: hashAdminPass,
    role: Role.ADMIN,
    fullName: 'Chief Moderator (Trust & Safety)',
    phone: '+91 98000 00001',
    isEmailVerified: true,
    isPhoneVerified: true,
    isAadhaarVerified: true,
    createdAt: new Date(),
  });
}

seedDemoUsers();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload = { sub: userId, email, role };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    // Calculate refresh token expiry date (default 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      // Store hashed refresh token in database for rotation tracking
      await this.prisma.refreshToken.create({
        data: {
          tokenHash: this.hashToken(refreshToken),
          userId,
          expiresAt,
        },
      });
    } catch {
      // In-memory/offline mode: database unavailable, skip DB persistence
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
    };
  }

  async signup(dto: SignupDto): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const emailKey = dto.email.toLowerCase();
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: emailKey },
      });

      if (existing) {
        throw new ConflictException('An account with this email already exists');
      }

      const passwordHash = await bcryptjs.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: emailKey,
          passwordHash,
          role: dto.role,
          ...(dto.role === Role.STUDENT && {
            studentProfile: {
              create: {
                fullName: dto.fullName,
                phone: dto.phone,
                collegeName: dto.collegeName,
              },
            },
          }),
          ...(dto.role === Role.OWNER && {
            ownerProfile: {
              create: {
                fullName: dto.fullName,
                phone: dto.phone,
              },
            },
          }),
        },
      });

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Send verification email via notifications interface
      try {
        await this.notificationsService.send({
          recipient: user.email,
          type: 'EMAIL_VERIFICATION',
          data: {
            userId: user.id,
            fullName: dto.fullName,
          },
        });
      } catch {}

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          fullName: dto.fullName,
          createdAt: user.createdAt,
        },
        tokens,
      };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      this.logger.warn(`Database fallback for signup (${dto.email}): ${err.message}`);

      if (IN_MEMORY_USERS.has(emailKey)) {
        throw new ConflictException('An account with this email already exists');
      }

      const passwordHash = await bcryptjs.hash(dto.password, 10);
      const id = `usr-${dto.role.toLowerCase()}-${Date.now()}`;
      const memUser: InMemoryUser = {
        id,
        email: emailKey,
        passwordHash,
        role: dto.role,
        fullName: dto.fullName,
        phone: dto.phone,
        collegeName: dto.collegeName,
        isEmailVerified: true,
        isPhoneVerified: Boolean(dto.phone),
        isAadhaarVerified: false,
        createdAt: new Date(),
      };
      IN_MEMORY_USERS.set(emailKey, memUser);

      const tokens = await this.generateTokens(memUser.id, memUser.email, memUser.role);
      return {
        user: {
          id: memUser.id,
          email: memUser.email,
          role: memUser.role,
          isEmailVerified: memUser.isEmailVerified,
          fullName: memUser.fullName,
          createdAt: memUser.createdAt,
        },
        tokens,
      };
    }
  }

  async login(dto: LoginDto): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const emailKey = dto.email.toLowerCase();
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: emailKey },
        include: {
          studentProfile: true,
          ownerProfile: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordValid = await bcryptjs.compare(dto.password, user.passwordHash);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      const fullName = user.studentProfile?.fullName || user.ownerProfile?.fullName;

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          fullName,
          createdAt: user.createdAt,
        },
        tokens,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.warn(`Database fallback for login (${dto.email}): ${err.message}`);

      const memUser = IN_MEMORY_USERS.get(emailKey);
      if (!memUser) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const passwordValid = await bcryptjs.compare(dto.password, memUser.passwordHash);
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const tokens = await this.generateTokens(memUser.id, memUser.email, memUser.role);
      return {
        user: {
          id: memUser.id,
          email: memUser.email,
          role: memUser.role,
          isEmailVerified: memUser.isEmailVerified,
          fullName: memUser.fullName,
          createdAt: memUser.createdAt,
        },
        tokens,
      };
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')!;

    let payload: { sub: string; email: string; role: Role };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    try {
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        if (storedToken) {
          await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        }
        if (storedToken) throw new UnauthorizedException('Refresh token revoked or expired');
      } else {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
      }
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      // In offline mode, skip DB check if verifyAsync succeeded
    }

    return this.generateTokens(payload.sub, payload.email, payload.role);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string): Promise<SanitizedUser> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          ownerProfile: true,
        },
      });

      if (user) {
        const fullName = user.studentProfile?.fullName || user.ownerProfile?.fullName;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          fullName,
          createdAt: user.createdAt,
        };
      }
    } catch {
      // Fallback to in-memory lookup
    }

    for (const mem of IN_MEMORY_USERS.values()) {
      if (mem.id === userId) {
        return {
          id: mem.id,
          email: mem.email,
          role: mem.role,
          isEmailVerified: mem.isEmailVerified,
          fullName: mem.fullName,
          createdAt: mem.createdAt,
        };
      }
    }

    throw new NotFoundException('User not found');
  }

  async sendEmailVerification(userId: string): Promise<{ sent: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')!;
    const verificationToken = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'EMAIL_VERIFICATION' },
      { secret: accessSecret, expiresIn: '24h' as any },
    );

    await this.notificationsService.send({
      recipient: user.email,
      type: 'EMAIL_VERIFICATION',
      data: {
        token: verificationToken,
      },
    });

    return { sent: true };
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')!;

    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(token, { secret: accessSecret });
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (payload.purpose !== 'EMAIL_VERIFICATION') {
      throw new BadRequestException('Invalid token purpose');
    }

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { isEmailVerified: true },
    });

    return { verified: true };
  }

  // --- OTP & Multi-Factor Verification (Twilio SMS & SendGrid Email) ---

  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  private generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailOtp(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const otp = this.generate6DigitOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otpStore.set(`email_${normalizedEmail}`, { otp, expiresAt });

    await this.notificationsService.send({
      recipient: normalizedEmail,
      type: 'EMAIL_OTP',
      data: { otp },
    });

    return {
      success: true,
      message: 'Email verification code sent successfully via SendGrid',
      devOtp: otp,
    };
  }

  async verifyEmailOtp(email: string, enteredOtp: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = `email_${normalizedEmail}`;
    const record = this.otpStore.get(key);

    if (!record || Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('Verification code has expired or does not exist. Please request a new code.');
    }

    if (record.otp !== enteredOtp.trim()) {
      throw new BadRequestException('Invalid email verification code. Please try again.');
    }

    this.otpStore.delete(key);

    // If user already registered, mark verified
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    return { success: true, message: 'Email successfully verified' };
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const normalizedPhone = phone.trim();
    const otp = this.generate6DigitOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otpStore.set(`phone_${normalizedPhone}`, { otp, expiresAt });

    await this.notificationsService.send({
      recipient: normalizedPhone,
      type: 'SMS_OTP',
      data: { otp },
    });

    return {
      success: true,
      message: 'SMS verification code sent successfully via Twilio',
      devOtp: otp,
    };
  }

  async verifyPhoneOtp(phone: string, enteredOtp: string): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    const normalizedPhone = phone.trim();
    const key = `phone_${normalizedPhone}`;
    const record = this.otpStore.get(key);

    if (!record || Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('SMS verification code has expired or does not exist.');
    }

    if (record.otp !== enteredOtp.trim()) {
      throw new BadRequestException('Invalid SMS verification code.');
    }

    this.otpStore.delete(key);

    // Find user by phone number across student & owner profiles
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { studentProfile: { phone: normalizedPhone } },
          { ownerProfile: { phone: normalizedPhone } },
        ],
      },
      include: {
        studentProfile: true,
        ownerProfile: true,
      },
    });

    // If user doesn't exist, create an account for phone login
    if (!user) {
      const cleanPhoneDigits = normalizedPhone.replace(/[^0-9]/g, '');
      const tempEmail = `scholar_${cleanPhoneDigits || Date.now()}@studentnest.demo`;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcryptjs.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email: tempEmail,
          passwordHash,
          role: Role.STUDENT,
          isEmailVerified: true,
          studentProfile: {
            create: {
              fullName: `Scholar (${normalizedPhone.slice(-4) || 'New'})`,
              phone: normalizedPhone,
            },
          },
        },
        include: {
          studentProfile: true,
          ownerProfile: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const fullName = user.studentProfile?.fullName || user.ownerProfile?.fullName;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        fullName,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async verifyDemoAadhaar(
    aadhaarNumber: string,
    userId?: string
  ): Promise<{ success: boolean; verified: boolean; message: string; maskedAadhaar: string }> {
    const cleanNumber = aadhaarNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 12) {
      throw new BadRequestException('Aadhaar number must contain exactly 12 digits');
    }

    const maskedAadhaar = `XXXX-XXXX-${cleanNumber.slice(-4)}`;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { ownerProfile: true },
      });

      if (user?.ownerProfile) {
        await this.prisma.ownerProfile.update({
          where: { id: user.ownerProfile.id },
          data: {
            isAadhaarVerified: true,
            aadhaarNumberHash: this.hashToken(cleanNumber),
          },
        });
      }
    }

    return {
      success: true,
      verified: true,
      message: 'DigiLocker Aadhaar e-KYC verified successfully',
      maskedAadhaar,
    };
  }

  async skipAadhaar(userId?: string): Promise<{ success: boolean; skipped: boolean; message: string }> {
    return {
      success: true,
      skipped: true,
      message: 'Aadhaar verification postponed. You can verify your ID later from your profile.',
    };
  }
  async validateOAuthUser(profile: {
    email: string;
    fullName: string;
    provider: string;
    providerId: string;
    role?: Role;
  }): Promise<{ user: SanitizedUser; tokens: AuthTokens }> {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
      include: { studentProfile: true, ownerProfile: true },
    });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcryptjs.hash(randomPassword, 10);
      const role = profile.role || Role.STUDENT;

      user = await this.prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          passwordHash,
          role,
          isEmailVerified: true,
          studentProfile: {
            create: {
              fullName: profile.fullName,
            },
          },
        },
        include: { studentProfile: true, ownerProfile: true },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const fullName = user.studentProfile?.fullName || user.ownerProfile?.fullName;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        fullName,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }
}
