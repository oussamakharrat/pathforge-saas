import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { PortfolioStatus } from '@prisma/client';

export class CreatePortfolioProjectDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() technologies?: string[];
  @IsOptional() @IsString() repoUrl?: string;
  @IsOptional() @IsString() demoUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsEnum(PortfolioStatus) status?: PortfolioStatus;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}

export class UpdatePortfolioProjectDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() technologies?: string[];
  @IsOptional() @IsString() repoUrl?: string;
  @IsOptional() @IsString() demoUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsEnum(PortfolioStatus) status?: PortfolioStatus;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}
