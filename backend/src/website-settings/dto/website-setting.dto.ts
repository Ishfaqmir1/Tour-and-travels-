/**
 * DTOs for dynamic website settings (key-value store with metadata).
 * Settings can be grouped and typed for the admin settings panel.
 * The 'value' field accepts any type for flexibility.
 * @see WebsiteSettingsController
 */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebsiteSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  value: any;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateWebsiteSettingDto {
  value: any;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateWebsiteSettingByKeyDto {
  value: any;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  group?: string;
}
