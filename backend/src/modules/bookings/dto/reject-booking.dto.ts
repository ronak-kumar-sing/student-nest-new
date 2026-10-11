import { IsOptional, IsString } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
