import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  listingId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Message text cannot be empty' })
  content!: string;
}
