import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateNegotiationDto {
  @IsString() offerId: string;
  @IsObject() offeredSalary: { amount: number; currency: string };
  @IsObject() targetSalary: { amount: number; currency: string };
  @IsOptional() @IsString() strategy?: string;
  @IsOptional() @IsArray() talkingPoints?: string[];
}

export class UpdateNegotiationDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsObject() finalSalary?: { amount: number; currency: string };
  @IsOptional() @IsString() strategy?: string;
  @IsOptional() @IsArray() talkingPoints?: string[];
}
