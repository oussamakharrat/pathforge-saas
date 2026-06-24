import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreatePostDto,
  CreateCommentDto,
  CreateReactionDto,
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

  @Post('posts/:id/comments')
  addComment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(user.id, id, dto);
  }

  @Post('posts/:id/reactions')
  addReaction(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.service.addReaction(user.id, id, dto);
  }
}
