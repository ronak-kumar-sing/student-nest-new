import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { InitiateChatDto } from './dto/initiate-chat.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/v1/chat/conversations
   * Returns list of conversations for current authenticated user
   */
  @Get('conversations')
  getConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.getUserConversations(user.userId);
  }

  /**
   * GET /api/v1/chat/conversations/:id/messages
   * Returns messages for a specific conversation
   */
  @Get('conversations/:id/messages')
  getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.getConversationMessages(conversationId, user.userId);
  }

  /**
   * POST /api/v1/chat/send
   * Sends a message to a conversation or receiver
   */
  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.userId, dto);
  }

  /**
   * POST /api/v1/chat/initiate
   * Starts or resolves a conversation thread with a partner
   */
  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  initiateChat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateChatDto,
  ) {
    return this.chatService.initiateConversation(user.userId, dto);
  }
}
