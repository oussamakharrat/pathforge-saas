import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsObject,
  IsDateString,
  IsBoolean,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
} from '@prisma/client';

function normalizeSalaryRange(
  value: unknown,
): Record<string, unknown> | undefined {
  if (typeof value === 'string') return { display: value };
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export class CreateJobPostingDto {
  @IsString() company: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional()
  @Transform(({ value }) => normalizeSalaryRange(value) ?? {})
  @IsObject()
  salaryRange?: Record<string, unknown>;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() companyLogo?: string;
  @IsOptional() @IsInt() matchScore?: number;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class UpdateJobPostingDto {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional()
  @Transform(({ value }) => normalizeSalaryRange(value))
  @IsObject()
  salaryRange?: Record<string, unknown>;
  @IsOptional() @IsInt() matchScore?: number;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class CreateApplicationDto {
  @IsString() jobId: string;
  @IsOptional() @IsString() goalId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus) status: ApplicationStatus;
}

export class CreateInterviewDto {
  @IsEnum(InterviewType) type: InterviewType;
  @IsDateString() date: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsBoolean() isMock?: boolean;
}

export class UpdateInterviewDto {
  @IsOptional() @IsEnum(InterviewStatus) status?: InterviewStatus;
  @IsOptional() @IsInt() @Min(0) @Max(100) score?: number;
  @IsOptional() @IsString() feedback?: string;
  @IsOptional() answers?: unknown[];
}

export class CreateOfferDto {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsObject() baseSalary: { amount: number; currency: string };
  @IsOptional() @IsString() equity?: string;
  @IsOptional() @IsString() bonus?: string;
  @IsOptional() @IsArray() benefits?: string[];
  @IsOptional() @IsDateString() decisionDeadline?: string;
}
