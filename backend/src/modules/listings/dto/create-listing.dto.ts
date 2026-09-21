import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomType } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city!: string;

  @IsNumber()
  @Type(() => Number)
  latitude!: number;

  @IsNumber()
  @Type(() => Number)
  longitude!: number;

  @IsNumber()
  @Min(500, { message: 'Price per month must be at least ₹500' })
  @Type(() => Number)
  pricePerMonth!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  securityDeposit?: number;

  @IsEnum(RoomType, { message: 'Invalid room type' })
  roomType!: RoomType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
