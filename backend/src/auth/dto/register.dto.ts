/**
 * DTO for new user registration.
 *
 * Validates all required registration fields:
 * - name: must be a non-empty string
 * - email: must be a valid email format
 * - password: must be at least 6 characters for security
 *
 * All fields are required. Invalid inputs return 422 with field-specific
 * error messages from the custom validation options.
 *
 * @see AuthController.register()
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
