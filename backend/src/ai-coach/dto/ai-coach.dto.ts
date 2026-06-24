import { IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() context?: string;
}

export class SendMessageDto {
  @IsString() content: string;
}
