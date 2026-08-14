import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class CreateCommentDto {
  @IsString() body: string;
  @IsOptional() @IsString() parentCommentId?: string;
}

export class CreateReactionDto {
  @IsString() type: string;
}

export class UpdatePostDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class UpdateCommentDto {
  @IsString() body: string;
}
