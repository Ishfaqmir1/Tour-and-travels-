/**
 * DTO for creating tour destinations with backward-compatible name field.
 * Supports both 'title' and 'name' field names for admin panel compatibility.
 * @see TourDestinationsController.create()
 */
import { IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  /** Backward compatibility: admin panel may send 'name' instead of 'title' */
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  location_label?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  rating?: number;
}

export class UpdateDestinationDto {
  @IsOptional()
  @IsString()
  title?: string;

  /** Backward compatibility: admin panel may send 'name' instead of 'title' */
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  is_active?: boolean;

  /** Backward compatibility: admin panel may send 'isActive' instead of 'is_active' */
  @IsOptional()
  isActive?: boolean;
}
