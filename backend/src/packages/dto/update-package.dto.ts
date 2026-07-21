/**
 * DTO for updating existing tour packages.
 * All fields are optional for partial updates.
 * Supports updating day-wise itinerary via nested PackageDayUpdateDto array.
 * @see PackagesController.update()
 */
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';

class PackageDayUpdateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  day_number?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  activities?: string[];

  @IsOptional()
  @IsString()
  meals?: string;

  @IsOptional()
  @IsString()
  hotel?: string;
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  destination_id?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsArray()
  included?: string[];

  @IsOptional()
  @IsArray()
  excluded?: string[];

  @IsOptional()
  @IsArray()
  hotels?: string[];

  @IsOptional()
  @IsArray()
  meals?: string[];

  @IsOptional()
  @IsString()
  transportation?: string;

  @IsOptional()
  @IsString()
  best_season?: string;

  @IsOptional()
  @IsString()
  cancellation_policy?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageDayUpdateDto)
  days?: PackageDayUpdateDto[];
}
