import { Injectable, BadRequestException } from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsHelper } from '../common/notifications.helper';
import { GamificationUnlockService } from '../common/gamification-unlock.service';
import { assertFound, assertOwner } from '../common/assertions';
import {
  CreatePostDto,
  CreateCommentDto,
  CreateReactionDto,
  UpdatePostDto,
  UpdateCommentDto,
} from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsHelper,
    private readonly gamification: GamificationUnlockService,
  ) {}

  async listPosts() {
    const posts = await this.prisma.communityPost.findMany({
      where: { isArchived: false },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        user: { select: { displayName: true, email: true } },
      },
    });

    return posts.map((post) => ({
      ...post,
      authorName:
        post.user.displayName || post.user.email.split('@')[0] || 'Member',
    }));
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
    const post = await this.prisma.communityPost.create({
      data: {
        userId,
        title: dto.title,
        body: dto.body,
        tags: dto.tags ?? [],
      },
    });
    await this.gamification.onCommunityEngagement(userId);
    return post;
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
        '/app/community',
      );
    }

    await this.gamification.onCommunityEngagement(userId);
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

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = assertFound(
      await this.prisma.communityPost.findUnique({ where: { id: postId } }),
      'Post',
    );
    assertOwner(post.userId, userId);

    return this.prisma.communityPost.update({
      where: { id: postId },
      data: {
        title: dto.title,
        body: dto.body,
        tags: dto.tags,
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = assertFound(
      await this.prisma.communityPost.findUnique({ where: { id: postId } }),
      'Post',
    );
    assertOwner(post.userId, userId);

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { isArchived: true },
    });
    return { deleted: true };
  }

  async updateComment(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = assertFound(
      await this.prisma.communityComment.findUnique({ where: { id: commentId } }),
      'Comment',
    );
    assertOwner(comment.userId, userId);

    return this.prisma.communityComment.update({
      where: { id: commentId },
      data: { body: dto.body },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = assertFound(
      await this.prisma.communityComment.findUnique({
        where: { id: commentId },
        include: { post: true },
      }),
      'Comment',
    );
    assertOwner(comment.userId, userId);

    await this.prisma.communityComment.delete({ where: { id: commentId } });
    await this.prisma.communityPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
    return { deleted: true };
  }

  async removeReaction(userId: string, postId: string) {
    await this.getPost(postId);
    const existing = await this.prisma.communityReaction.findFirst({
      where: { postId, userId },
    });
    if (!existing) {
      throw new BadRequestException('Reaction not found');
    }

    await this.prisma.communityReaction.delete({ where: { id: existing.id } });
    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { reactionCount: { decrement: 1 } },
    });
    return { removed: true };
  }
}
