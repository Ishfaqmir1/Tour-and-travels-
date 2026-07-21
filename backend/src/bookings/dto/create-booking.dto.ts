/**
 * DTO for creating a new package booking.
 *
 * Validates the booking form submission from the frontend's booking page.
 * All fields are sanitized and validated via class-validator decorators
 * before reaching the controller, preventing invalid or malicious data.
 *
 * Fields marked as optional can be omitted or left empty in the request body.
 * The global ValidationPipe strips unknown properties (whitelist: true)
 * and auto-transforms string inputs to the declared types (transform: true).
 *
 * @see BookingsController.create() for the controller that uses this DTO
 */
import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @IsNotEmpty()
  package_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customer_name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  customer_email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  customer_phone?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  travelers: number;

  @IsDateString()
  travel_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  special_requests?: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
