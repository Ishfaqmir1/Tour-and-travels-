/**
 * DTO for user login authentication.
 *
 * Validates the email and password submitted from the login form.
 * Email must be a valid format; password must not be empty.
 * Both fields are required with custom error messages for clarity.
 *
 * @see AuthController.login() for the endpoint handler
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1)
  password: string;
}
