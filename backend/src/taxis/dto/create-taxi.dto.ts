/**
 * DTO for creating taxi/transport services with driver info and pricing.
 * Supports driver name/phone, vehicle capacity (1-50), and per-km pricing.
 * @see TaxisController.create()
 */
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString, MaxLength, Max, Min } from 'class-validator';

export class CreateTaxiDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  driver_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  driver_phone?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_km?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  amenities?: string[];
}

export class UpdateTaxiDto {
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
  @IsString()
  driver_name?: string;

  @IsOptional()
  @IsString()
  driver_phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_km?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  is_active?: boolean;
}
