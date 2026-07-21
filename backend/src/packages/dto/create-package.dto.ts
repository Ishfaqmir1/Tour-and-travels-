/**
 * DTO for creating a new tour package with full itinerary.
 *
 * This is the most comprehensive DTO in the system, supporting:
 * - Basic package info (title, location, price, duration)
 * - Pricing with discount percentage (0-100%)
 * - Media (image, video, gallery images)
 * - Content (overview, highlights, included/excluded items)
 * - Day-wise itinerary (nested PackageDayDto array with activities,
 *   meals, and hotel info per day)
 * - Metadata (SEO fields, category, featured/active flags)
 *
 * Nested validation is enabled via @ValidateNested + @Type decorators
 * from class-validator and class-transformer respectively.
 *
 * @see PackagesController.create()
 */
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Max, Min, ValidateNested } from 'class-validator';

/**
 * Represents a single day within a package itinerary.
 * Used as a nested validation object inside CreatePackageDto.days array.
 */
class PackageDayDto {
  @IsInt()
  @Min(1)
  day_number: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

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

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  video?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsInt()
  destination_id?: number;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsString()
  @IsNotEmpty()
  overview: string;

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
  @IsString()
  category?: string;

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
  @Type(() => PackageDayDto)
  days?: PackageDayDto[];
}
