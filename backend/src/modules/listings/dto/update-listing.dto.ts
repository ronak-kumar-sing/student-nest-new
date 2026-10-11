import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomType } from '@prisma/client';

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsNumber()
  @Min(500)
  @IsOptional()
  @Type(() => Number)
  pricePerMonth?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  securityDeposit?: number;

  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

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
