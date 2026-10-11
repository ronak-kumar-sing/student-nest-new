import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitiateChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Recipient user ID is required' })
  recipientId!: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsOptional()
  @IsString()
  initialMessage?: string;
}
