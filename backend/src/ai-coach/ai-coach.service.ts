import { Injectable } from '@nestjs/common';
import { AIMessageRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertFound, assertOwner } from '../common/assertions';
import { CreateConversationDto, SendMessageDto } from './dto/ai-coach.dto';

@Injectable()
export class AiCoachService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversation(userId: string, id: string) {
    const conv = assertFound(
      await this.prisma.aIConversation.findUnique({
        where: { id },
        include: { messages: { orderBy: { order: 'asc' } } },
      }),
      'Conversation',
    );
    assertOwner(conv.userId, userId);
    return conv;
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    return this.prisma.aIConversation.create({
      data: {
        userId,
        title: dto.title ?? 'New conversation',
        context: dto.context ?? '',
      },
    });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const conv = await this.getConversation(userId, conversationId);
    const order = conv.messages.length;

    const userMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: AIMessageRole.user,
        content: dto.content,
        order,
      },
    });

    const assistantContent = this.generateStubResponse(
      dto.content,
      conv.context,
    );
    const assistantMessage = await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: AIMessageRole.assistant,
        content: assistantContent,
        order: order + 1,
        tokensUsed: Math.ceil(assistantContent.length / 4),
      },
    });

    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: order + 2,
        updatedAt: new Date(),
        title:
          conv.title === 'New conversation'
            ? dto.content.slice(0, 60)
            : conv.title,
      },
    });

    return { userMessage, assistantMessage };
  }

  private generateStubResponse(userContent: string, context: string): string {
    const ctx = context ? ` (context: ${context})` : '';
    return `Thanks for your question about "${userContent.slice(0, 80)}"${ctx}. Focus on measurable outcomes, align your story with the target role, and prepare 2–3 concrete examples using the STAR method.`;
  }
}
