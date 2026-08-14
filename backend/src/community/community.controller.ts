import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreatePostDto,
  CreateCommentDto,
  CreateReactionDto,
  UpdatePostDto,
  UpdateCommentDto,
} from './dto/community.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get('posts')
  listPosts() {
    return this.service.listPosts();
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.service.getPost(id);
  }

  @Post('posts')
  createPost(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
    return this.service.createPost(user.id, dto);
  }

  @Patch('posts/:id')
  updatePost(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.service.updatePost(user.id, id, dto);
  }

  @Delete('posts/:id')
  deletePost(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.deletePost(user.id, id);
  }

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(user.id, id, dto);
  }

  @Patch('comments/:commentId')
  updateComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.service.updateComment(user.id, commentId, dto);
  }

  @Delete('comments/:commentId')
  deleteComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
  ) {
    return this.service.deleteComment(user.id, commentId);
  }

  @Post('posts/:id/reactions')
  addReaction(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.service.addReaction(user.id, id, dto);
  }

  @Delete('posts/:id/reactions')
  removeReaction(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.removeReaction(user.id, id);
  }
}
