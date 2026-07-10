import { IsString, IsObject, IsOptional } from 'class-validator';

export class AnalyzeOfferDto {
  @IsString() company: string;
  @IsString() role: string;
  @IsOptional() @IsString() location?: string;
  @IsObject() offeredSalary: { amount: number; currency: string };
  @IsObject() targetSalary: { amount: number; currency: string };
  @IsOptional() @IsString() strategy?: string;
}
