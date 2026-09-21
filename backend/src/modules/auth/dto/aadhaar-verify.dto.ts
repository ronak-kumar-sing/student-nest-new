import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AadhaarVerifyDemoDto {
  @IsString()
  @IsNotEmpty({ message: 'Aadhaar number is required' })
  @Length(12, 14, { message: 'Aadhaar number must be 12 digits' })
  aadhaarNumber!: string;

  @IsString()
  @IsOptional()
  otp?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
