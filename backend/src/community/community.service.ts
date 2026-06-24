import { Injectable, BadRequestException } from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from '../common/notifications.helper';
import { assertFound } from '../common/assertions';
import { CreatePostDto, CreateCommentDto, CreateReactionDto } from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsHelper,
  ) {}

  async listPosts() {
    return this.prisma.communityPost.findMany({
      where: { isArchived: false },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async getPost(id: string) {
    return assertFound(
      await this.prisma.communityPost.findUnique({
        where: { id },
        include: {
          comments: { orderBy: { createdAt: 'asc' } },
          reactions: true,
        },
      }),
      'Post',
    );
  }

  async createPost(userId: string, dto: CreatePostDto) {
    return this.prisma.communityPost.create({
      data: {
        userId,
        title: dto.title,
        body: dto.body,
        tags: dto.tags ?? [],
      },
    });
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.getPost(postId);

    const comment = await this.prisma.communityComment.create({
      data: {
        postId,
        userId,
        body: dto.body,
        parentCommentId: dto.parentCommentId,
      },
    });

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { commentCount: post.commentCount + 1 },
    });

    if (post.userId !== userId) {
      await this.notifications.create(
        post.userId,
        'community_reply',
        'New comment on your post',
        dto.body.slice(0, 100),
        postId,
        'community_post',
        '/community',
      );
    }

    return comment;
  }

  async addReaction(userId: string, postId: string, dto: CreateReactionDto) {
    await this.getPost(postId);
    const type = dto.type as ReactionType;

    try {
      const reaction = await this.prisma.communityReaction.create({
        data: { postId, userId, type },
      });

      await this.prisma.communityPost.update({
        where: { id: postId },
        data: { reactionCount: { increment: 1 } },
      });

      return reaction;
    } catch {
      throw new BadRequestException('Reaction already exists');
    }
  }
}
