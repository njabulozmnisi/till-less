import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { IngestionStrategy } from '@prisma/client';

export class CreateIngestionConfigDto {
  @IsEnum(IngestionStrategy)
  strategy!: IngestionStrategy;

  @IsObject()
  config!: Record<string, any>;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  cadence?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
