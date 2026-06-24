import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateLearningPlanDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() goalId?: string;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
  @IsOptional() items?: CreateLearningItemDto[];
}

export class UpdateLearningPlanDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() goalId?: string;
  @IsOptional() @IsString() status?: string;
}

export class CreateLearningItemDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsInt() skillBoostAmount?: number;
}

export class ToggleLearningItemDto {
  @IsOptional() @IsBoolean() completed?: boolean;
}
