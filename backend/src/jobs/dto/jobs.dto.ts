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
} from 'class-validator';

export class CreateJobPostingDto {
  @IsString() company: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsObject() salaryRange?: Record<string, unknown>;
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
  @IsOptional() @IsObject() salaryRange?: Record<string, unknown>;
  @IsOptional() @IsInt() matchScore?: number;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class CreateApplicationDto {
  @IsString() jobId: string;
  @IsOptional() @IsString() goalId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
}

export class UpdateApplicationStatusDto {
  @IsString() status: string;
}

export class CreateInterviewDto {
  @IsString() type: string;
  @IsDateString() date: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsBoolean() isMock?: boolean;
}

export class UpdateInterviewDto {
  @IsOptional() @IsString() status?: string;
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
