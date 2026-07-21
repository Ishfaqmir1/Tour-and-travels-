/**
 * DTO for processing a tour guide payment.
 *
 * Validates payment form submissions including:
 * - guide_id: must reference a valid tour guide
 * - days: minimum 1 day booking
 * - Card details (name, number, expiry, CVV) with regex validation
 *   for PCI-compliant format checking
 *
 * Card number must be 13-19 digits (supports major card networks).
 * Expiry must follow MM/YY format. CVV must be 3-4 digits.
 *
 * NOTE: Card validation is format-only; actual payment processing
 * is handled by the PaymentsController.
 *
 * @see PaymentsController.create()
 */
import { IsInt, IsNotEmpty, IsString, MaxLength, Min, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  guide_id: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  days: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name_on_card: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'Please enter a valid card number' })
  card_number: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Use MM/YY format' })
  expiry: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3-4 digits' })
  cvv: string;
}
