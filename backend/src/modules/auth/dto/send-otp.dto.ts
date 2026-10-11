import { IsNotEmpty, IsString } from 'class-validator';

export class SendEmailOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

export class SendPhoneOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone!: string;
}
