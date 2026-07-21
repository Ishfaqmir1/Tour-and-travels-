/**
 * DTO for creating tour guide profiles with ratings, languages, and pricing.
 * Rating supports 1-5 scale; hire_cost supports daily pricing.
 * Optional fields for contact info and destination association.
 * @see TourGuidesController.create()
 */
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateTourGuideDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experience_years?: number;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hire_cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  destination_id?: number;
}

export class UpdateTourGuideDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experience_years?: number;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hire_cost?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  destination_id?: number;
}
