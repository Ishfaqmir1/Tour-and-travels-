/**
 * DTO for contact form submissions from the public website.
 * Validates name, email (with format check), and message body.
 * Message length is capped at 5000 characters.
 * @see ContactMessagesController.create()
 */
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255)
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(5000, { message: 'Message must be under 5000 characters' })
  message: string;
}
