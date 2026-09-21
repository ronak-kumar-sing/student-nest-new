import { IsOptional, IsString } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
