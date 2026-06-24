import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() currentRole?: string;
  @IsOptional() @IsString() targetRole?: string;
  @IsOptional() @IsString() experienceLevel?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsArray() preferredIndustries?: string[];
  @IsOptional() @IsBoolean() onboardingComplete?: boolean;
  @IsOptional() @IsString() displayName?: string;
}

export class UpsertUserSkillDto {
  @ValidateIf((dto: UpsertUserSkillDto) => !dto.name)
  @IsString()
  skillCatalogId?: string;

  @ValidateIf((dto: UpsertUserSkillDto) => !dto.skillCatalogId)
  @IsString()
  name?: string;

  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) currentLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) targetLevel?: number;
}

export class UpdateUserSkillDto {
  @IsOptional() @IsInt() @Min(0) @Max(100) currentLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) targetLevel?: number;
}
