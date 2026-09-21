import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'Razorpay order ID is required' })
  razorpayOrderId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Razorpay payment ID is required' })
  razorpayPaymentId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Razorpay signature is required' })
  razorpaySignature!: string;
}
