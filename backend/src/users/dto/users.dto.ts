import { IsString, IsOptional, IsArray, IsBoolean, IsInt, Min, Max } from 'class-validator';

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
  @IsString() skillCatalogId: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) currentLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) targetLevel?: number;
}

export class UpdateUserSkillDto {
  @IsOptional() @IsInt() @Min(0) @Max(100) currentLevel?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) targetLevel?: number;
}
