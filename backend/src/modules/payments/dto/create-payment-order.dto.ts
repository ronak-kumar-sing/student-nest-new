import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Booking ID is required' })
  bookingId!: string;
}
