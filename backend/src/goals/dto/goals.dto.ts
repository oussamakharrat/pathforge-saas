import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateGoalDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() targetDate?: string;
  @IsOptional() @IsString() careerPath?: string;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class UpdateGoalDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() targetDate?: string;
  @IsOptional() @IsString() careerPath?: string;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class AddMilestoneDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
}

export class ToggleMilestoneDto {
  @IsString() milestoneId: string;
  @IsOptional() @IsBoolean() completed?: boolean;
}
