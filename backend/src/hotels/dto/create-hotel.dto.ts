/**
 * DTO for creating hotel entries with star ratings (1-5) and amenities.
 * Name, image, location, and description are required.
 * @see HotelsController.create()
 */
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_night?: number;
}

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  name?: string;

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
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_night?: number;

  @IsOptional()
  is_active?: boolean;
}
