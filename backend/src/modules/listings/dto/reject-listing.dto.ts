import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectListingDto {
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @MinLength(5, { message: 'Rejection reason must be at least 5 characters long' })
  reason!: string;
}
