import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthenticatedUser } from './decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getCurrentUser(user.userId);
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sendVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.sendEmailVerification(user.userId);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  // --- Email OTP (SendGrid) ---

  @Post('email/send-otp')
  @HttpCode(HttpStatus.OK)
  sendEmailOtp(@Body('email') email: string) {
    return this.authService.sendEmailOtp(email);
  }

  @Post('email/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyEmailOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyEmailOtp(email, otp);
  }

  // --- Phone OTP (Twilio) & Phone Login ---

  @Post('phone/send-otp')
  @HttpCode(HttpStatus.OK)
  sendPhoneOtp(@Body('phone') phone: string) {
    return this.authService.sendPhoneOtp(phone);
  }

  @Post('phone/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyPhoneOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.authService.verifyPhoneOtp(phone, otp);
  }

  // --- DigiLocker Aadhaar Verification & Skip ---

  @Post('aadhaar/verify-demo')
  @HttpCode(HttpStatus.OK)
  verifyDemoAadhaar(
    @Body('aadhaarNumber') aadhaarNumber: string,
    @Body('userId') userId?: string,
  ) {
    return this.authService.verifyDemoAadhaar(aadhaarNumber, userId);
  }

  @Post('aadhaar/skip')
  @HttpCode(HttpStatus.OK)
  skipAadhaar(@Body('userId') userId?: string) {
    return this.authService.skipAadhaar(userId);
  }

  // --- Role Guard Example Endpoints ---

  @Get('student-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  studentOnlyEndpoint(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Access granted to student area',
      user,
    };
  }

  @Get('owner-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  ownerOnlyEndpoint(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Access granted to owner area',
      user,
    };
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminOnlyEndpoint(@CurrentUser() user: AuthenticatedUser) {
    return {
      message: 'Access granted to admin area',
      user,
    };
  }
}
