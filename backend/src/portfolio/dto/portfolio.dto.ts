import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreatePortfolioProjectDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() technologies?: string[];
  @IsOptional() @IsString() repoUrl?: string;
  @IsOptional() @IsString() demoUrl?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() status?: string;
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
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsArray() skillCatalogIds?: string[];
}
