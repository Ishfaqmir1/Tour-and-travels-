/**
 * DTO for authenticated password changes.
 * Requires the current password for verification and a new password
 * with minimum 6 character length.
 * @see AuthController.changePassword()
 */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  current_password: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  new_password: string;
}
