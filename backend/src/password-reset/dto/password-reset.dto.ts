/**
 * DTOs for the password reset flow (request code + reset with code).
 * ForgotPasswordDto: sends reset code to email.
 * ResetPasswordDto: validates email, reset code, and new password with confirmation.
 * @see PasswordResetController
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Reset code is required' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  password_confirmation: string;
}
