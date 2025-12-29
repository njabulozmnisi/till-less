import { IsString, IsOptional, IsBoolean, IsEmail, IsUrl } from 'class-validator';

export class CreateRetailerDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  displayName!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
