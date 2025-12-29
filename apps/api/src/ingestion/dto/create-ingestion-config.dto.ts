import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { IngestionStrategy } from '@prisma/client';

export class CreateIngestionConfigDto {
  @IsString()
  name!: string;

  @IsEnum(IngestionStrategy)
  strategy!: IngestionStrategy;

  @IsObject()
  config!: Record<string, any>;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
