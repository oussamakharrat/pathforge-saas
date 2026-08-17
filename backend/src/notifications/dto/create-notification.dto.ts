import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  sourceEntityId?: string;

  @IsOptional()
  @IsString()
  sourceEntityType?: string;
}
