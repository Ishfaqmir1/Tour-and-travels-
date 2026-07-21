/**
 * DTO for admin user updates (name, email, phone, admin status).
 * All fields are optional for partial updates.
 * @see AdminController.updateUser()
 */
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
