import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty({ message: 'Listing ID is required' })
  listingId!: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate!: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate!: string;
}
