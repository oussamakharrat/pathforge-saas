import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateResumeDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() sections?: CreateResumeSectionDto[];
}

export class CreateResumeSectionDto {
  @IsString() type: string;
  @IsString() title: string;
  @IsString() content: string;
  @IsOptional() @IsInt() order?: number;
}

export class UpdateResumeDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) atsScore?: number;
  @IsOptional() @IsArray() detectedKeywords?: string[];
  @IsOptional() @IsArray() missingKeywords?: string[];
  @IsOptional() @IsArray() suggestions?: string[];
}

export class UpdateResumeSectionDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsInt() order?: number;
}
