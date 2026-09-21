import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @Length(4, 6, { message: 'OTP must be 4-6 digits' })
  otp!: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;

  @IsString()
  @Length(4, 6, { message: 'OTP must be 4-6 digits' })
  otp!: string;
}
