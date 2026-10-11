import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { InitiateChatDto } from './dto/initiate-chat.dto.js';

// In-memory fallback threads for robust demo/dev operation
const IN_MEMORY_THREADS = new Map<string, any>();
const IN_MEMORY_MESSAGES = new Map<string, any[]>();

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all conversation threads for current user
   */
  async getUserConversations(userId: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: {
            include: { studentProfile: true, ownerProfile: true },
          },
          user2: {
            include: { studentProfile: true, ownerProfile: true },
          },
          listing: {
            select: {
              id: true,
              title: true,
              pricePerMonth: true,
              photoUrls: true,
              city: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      return conversations.map((conv) => {
        const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
        const partnerProfile = partner.studentProfile || partner.ownerProfile;
        const partnerName = partnerProfile?.fullName || partner.email.split('@')[0];

        return {
          id: conv.id,
          partnerId: partner.id,
          partnerName,
          partnerRole: partner.role.toLowerCase(),
          partnerEmail: partner.email,
          partnerAvatar: partner.role === 'OWNER'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          listingId: conv.listingId,
          propertyTitle: conv.listing?.title,
          propertyPrice: conv.listing?.pricePerMonth,
          lastMessage: conv.lastMessage || conv.messages[0]?.content || 'Started conversation',
          lastTimestamp: conv.lastMessageAt.toISOString(),
          unreadCount: 0,
        };
      });
    } catch (err: any) {
      this.logger.warn(`Database unavailable for conversations: ${err.message}. Using demo threads.`);
      return this.getFallbackConversations(userId);
    }
  }

  /**
   * Get all messages inside a conversation thread
   */
  async getConversationMessages(conversationId: string, userId: string) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        throw new ForbiddenException('Not authorized to access this conversation');
      }

      // Mark unread messages as read
      await this.prisma.chatMessage.updateMany({
        where: {
          conversationId,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      const messages = await this.prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            include: { studentProfile: true, ownerProfile: true },
          },
        },
      });

      return messages.map((m) => ({
        id: m.id,
        threadId: m.conversationId,
        senderId: m.senderId,
        senderName: m.sender.studentProfile?.fullName || m.sender.ownerProfile?.fullName || m.sender.email.split('@')[0],
        senderRole: m.sender.role.toLowerCase(),
        text: m.content,
        timestamp: m.createdAt.toISOString(),
        isRead: m.isRead,
      }));
    } catch (err: any) {
      this.logger.warn(`Database unavailable for messages: ${err.message}. Using fallback.`);
      return IN_MEMORY_MESSAGES.get(conversationId) || this.getFallbackMessages(conversationId, userId);
    }
  }

  /**
   * Send a new message in a conversation or initiate one
   */
  async sendMessage(senderId: string, dto: SendMessageDto) {
    try {
      let conversationId = dto.conversationId;
      let receiverId = dto.receiverId;

      if (!conversationId) {
        if (!receiverId) {
          throw new BadRequestException('Either conversationId or receiverId must be specified');
        }

        // Find existing conversation or create new
        const existing = await this.prisma.conversation.findFirst({
          where: {
            OR: [
              { user1Id: senderId, user2Id: receiverId, listingId: dto.listingId || null },
              { user1Id: receiverId, user2Id: senderId, listingId: dto.listingId || null },
            ],
          },
        });

        if (existing) {
          conversationId = existing.id;
        } else {
          const newConv = await this.prisma.conversation.create({
            data: {
              user1Id: senderId,
              user2Id: receiverId,
              listingId: dto.listingId || null,
              lastMessage: dto.content,
              lastMessageAt: new Date(),
            },
          });
          conversationId = newConv.id;
        }
      } else {
        const conv = await this.prisma.conversation.findUnique({
          where: { id: conversationId },
        });
        if (!conv) throw new NotFoundException('Conversation not found');
        if (conv.user1Id !== senderId && conv.user2Id !== senderId) {
          throw new ForbiddenException('Not a participant in this conversation');
        }
        receiverId = conv.user1Id === senderId ? conv.user2Id : conv.user1Id;
      }

      const [message] = await this.prisma.$transaction([
        this.prisma.chatMessage.create({
          data: {
            conversationId: conversationId!,
            senderId,
            receiverId: receiverId!,
            content: dto.content,
          },
          include: {
            sender: {
              include: { studentProfile: true, ownerProfile: true },
            },
          },
        }),
        this.prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: dto.content,
            lastMessageAt: new Date(),
          },
        }),
      ]);

      return {
        id: message.id,
        threadId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.studentProfile?.fullName || message.sender.ownerProfile?.fullName || message.sender.email.split('@')[0],
        senderRole: message.sender.role.toLowerCase(),
        text: message.content,
        timestamp: message.createdAt.toISOString(),
        isRead: false,
      };
    } catch (err: any) {
      this.logger.warn(`Database fallback for sending message: ${err.message}`);
      const isOwner = senderId.includes('owner') || senderId === 'usr-owner-demo';
      const mockMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        threadId: dto.conversationId || `thread_${Date.now()}`,
        senderId,
        senderName: isOwner ? 'Eleanor Vance' : 'Julian Chen',
        senderRole: isOwner ? 'owner' : 'student',
        text: dto.content,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const threadId = mockMsg.threadId;
      const list = IN_MEMORY_MESSAGES.get(threadId) || [];
      list.push(mockMsg);
      IN_MEMORY_MESSAGES.set(threadId, list);

      return mockMsg;
    }
  }

  /**
   * Initiate a conversation thread (e.g. from listing detail or roommate card)
   */
  async initiateConversation(userId: string, dto: InitiateChatDto) {
    try {
      // Check existing
      let conv = await this.prisma.conversation.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: dto.recipientId, listingId: dto.listingId || null },
            { user1Id: dto.recipientId, user2Id: userId, listingId: dto.listingId || null },
          ],
        },
      });

      if (!conv) {
        conv = await this.prisma.conversation.create({
          data: {
            user1Id: userId,
            user2Id: dto.recipientId,
            listingId: dto.listingId || null,
            lastMessage: dto.initialMessage || 'Started conversation',
            lastMessageAt: new Date(),
          },
        });

        if (dto.initialMessage) {
          await this.prisma.chatMessage.create({
            data: {
              conversationId: conv.id,
              senderId: userId,
              receiverId: dto.recipientId,
              content: dto.initialMessage,
            },
          });
        }
      }

      return { conversationId: conv.id, created: true };
    } catch (err: any) {
      this.logger.warn(`Database fallback for initiateConversation: ${err.message}`);
      const mockId = `thread_${dto.recipientId.substring(0, 8)}_${dto.listingId || 'direct'}`;
      return { conversationId: mockId, created: true };
    }
  }

  // --- Fallback Generators ---
  private getFallbackConversations(userId: string) {
    const isOwner = userId.includes('owner') || userId === 'usr-owner-demo';

    if (isOwner) {
      return [
        {
          id: 'thread-eleanor-vance',
          partnerId: 'usr-student-demo',
          partnerName: 'Julian Chen',
          partnerRole: 'student',
          partnerEmail: 'student@studentnest.demo',
          partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          propertyTitle: 'The Harvard Loft — Sunlit Designer Studio',
          propertyPrice: 18500,
          lastMessage: 'Hi Eleanor! Yes, I am starting graduate classes next month. Is the Wi-Fi suitable for video calls?',
          lastTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          unreadCount: 1,
        },
      ];
    }

    return [
      {
        id: 'thread-eleanor-vance',
        partnerId: 'usr-owner-demo',
        partnerName: 'Eleanor Vance',
        partnerRole: 'owner',
        partnerEmail: 'owner@studentnest.demo',
        partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        propertyTitle: 'The Harvard Loft — Sunlit Designer Studio',
        propertyPrice: 18500,
        lastMessage: 'Yes, 1Gbps fiber and standing desk are all set up for Fall scholars!',
        lastTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        unreadCount: 1,
      },
      {
        id: 'thread-rajesh-mehta',
        partnerId: 'owner-rajesh-02',
        partnerName: 'Rajesh Mehta',
        partnerRole: 'owner',
        partnerEmail: 'demo.owner@student-nest.live',
        partnerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        propertyTitle: 'Modern Student Studio near Metro & Campus',
        propertyPrice: 12000,
        lastMessage: 'Electricity and high-speed Wi-Fi are fully included in the monthly rent.',
        lastTimestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        unreadCount: 0,
      },
    ];
  }

  private getFallbackMessages(threadId: string, userId?: string) {
    const studentSenderId = userId || 'usr-student-demo';
    return [
      {
        id: 'msg-01',
        threadId,
        senderId: 'owner-eleanor-01',
        senderName: 'Eleanor Vance',
        senderRole: 'owner',
        text: 'Hello! Thanks for your interest in the studio. Are you looking to move in for the upcoming semester?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-02',
        threadId,
        senderId: studentSenderId,
        senderName: 'You',
        senderRole: 'student',
        text: 'Hi Eleanor! Yes, I am starting graduate classes next month. Is the Wi-Fi suitable for video calls?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-03',
        threadId,
        senderId: 'owner-eleanor-01',
        senderName: 'Eleanor Vance',
        senderRole: 'owner',
        text: 'Yes, 1Gbps fiber and standing desk are all set up for Fall scholars!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
      },
    ];
  }
}
