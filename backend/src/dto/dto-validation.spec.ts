/**
 * DTO Validation Unit Tests
 * ==========================
 *
 * Tests all backend Data Transfer Objects (DTOs) to ensure class-validator
 * decorators correctly enforce input validation rules.
 *
 * Covers 10 DTO classes across 24 test cases:
 * - Auth: LoginDto, RegisterDto
 * - Booking: CreateBookingDto (travelers range, email, date formats)
 * - Contact: CreateContactMessageDto
 * - Password Reset: ForgotPasswordDto, ResetPasswordDto
 * - Payments: CreatePaymentDto (card number, expiry, CVV formats)
 * - Packages: CreatePackageDto (price, title)
 * - Hotels: CreateHotelDto (star rating range)
 * - FAQs/Blog: required field validation
 *
 * Uses plainToInstance + validate from class-validator/class-transformer
 * to simulate the NestJS ValidationPipe in isolation.
 */
import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { CreateContactMessageDto } from '../contact-messages/dto/create-message.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '../password-reset/dto/password-reset.dto';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
import { CreateHotelDto } from '../hotels/dto/create-hotel.dto';
import { CreateFaqDto } from '../faqs/dto/create-faq.dto';
import { CreateBlogDto } from '../blog/dto/create-blog.dto';

describe('DTO Validation', () => {
  // ── Auth DTOs ──────────────────────────────────────────────────

  describe('LoginDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'not-an-email',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail with empty password', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail with missing email', async () => {
      const dto = plainToInstance(LoginDto, { password: 'test123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('RegisterDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with short password', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail with empty name', async () => {
      const dto = plainToInstance(RegisterDto, {
        name: '',
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Booking DTO ─────────────────────────────────────────────────

  describe('CreateBookingDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateBookingDto, {
        package_id: 1,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        travelers: 2,
        travel_date: '2026-08-15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with negative travelers', async () => {
      const dto = plainToInstance(CreateBookingDto, {
        package_id: 1,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        travelers: -1,
        travel_date: '2026-08-15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with too many travelers', async () => {
      const dto = plainToInstance(CreateBookingDto, {
        package_id: 1,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        travelers: 100,
        travel_date: '2026-08-15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(CreateBookingDto, {
        package_id: 1,
        customer_name: 'John Doe',
        customer_email: 'invalid',
        travelers: 1,
        travel_date: '2026-08-15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid date', async () => {
      const dto = plainToInstance(CreateBookingDto, {
        package_id: 1,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        travelers: 1,
        travel_date: 'not-a-date',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Contact Message DTO ─────────────────────────────────────────

  describe('CreateContactMessageDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateContactMessageDto, {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message.',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty name', async () => {
      const dto = plainToInstance(CreateContactMessageDto, {
        name: '',
        email: 'test@example.com',
        message: 'Test message',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(CreateContactMessageDto, {
        name: 'Test',
        email: 'invalid',
        message: 'Test message',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with empty message', async () => {
      const dto = plainToInstance(CreateContactMessageDto, {
        name: 'Test',
        email: 'test@example.com',
        message: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Password Reset DTOs ─────────────────────────────────────────

  describe('ForgotPasswordDto', () => {
    it('should pass with valid email', async () => {
      const dto = plainToInstance(ForgotPasswordDto, {
        email: 'test@example.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid email', async () => {
      const dto = plainToInstance(ForgotPasswordDto, { email: 'invalid' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ResetPasswordDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        email: 'test@example.com',
        code: 'abc123',
        password: 'newpassword123',
        password_confirmation: 'newpassword123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with short password', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        email: 'test@example.com',
        code: 'abc123',
        password: '12345',
        password_confirmation: '12345',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Payment DTO ─────────────────────────────────────────────────

  describe('CreatePaymentDto', () => {
    it('should pass with valid card data', async () => {
      const dto = plainToInstance(CreatePaymentDto, {
        guide_id: 1,
        days: 3,
        name_on_card: 'John Doe',
        card_number: '4111111111111111',
        expiry: '12/28',
        cvv: '123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid card number', async () => {
      const dto = plainToInstance(CreatePaymentDto, {
        guide_id: 1,
        days: 3,
        name_on_card: 'John Doe',
        card_number: '123',
        expiry: '12/28',
        cvv: '123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid expiry format', async () => {
      const dto = plainToInstance(CreatePaymentDto, {
        guide_id: 1,
        days: 3,
        name_on_card: 'John Doe',
        card_number: '4111111111111111',
        expiry: '2028-12',
        cvv: '123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid CVV', async () => {
      const dto = plainToInstance(CreatePaymentDto, {
        guide_id: 1,
        days: 3,
        name_on_card: 'John Doe',
        card_number: '4111111111111111',
        expiry: '12/28',
        cvv: '12',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Package DTO ─────────────────────────────────────────────────

  describe('CreatePackageDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreatePackageDto, {
        title: 'Test Package',
        image: 'https://example.com/img.jpg',
        location: 'Test Location',
        country: 'Test Country',
        duration: '3 Days',
        price: 1000,
        overview: 'A test package',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with negative price', async () => {
      const dto = plainToInstance(CreatePackageDto, {
        title: 'Test',
        image: 'https://example.com/img.jpg',
        location: 'Test',
        country: 'Test',
        duration: '3 Days',
        price: -100,
        overview: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with empty title', async () => {
      const dto = plainToInstance(CreatePackageDto, {
        title: '',
        image: 'https://example.com/img.jpg',
        location: 'Test',
        country: 'Test',
        duration: '3 Days',
        price: 100,
        overview: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Hotel DTO ───────────────────────────────────────────────────

  describe('CreateHotelDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateHotelDto, {
        name: 'Test Hotel',
        image: 'https://example.com/hotel.jpg',
        location: 'Test Location',
        description: 'A test hotel',
        stars: 4,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with stars > 5', async () => {
      const dto = plainToInstance(CreateHotelDto, {
        name: 'Test',
        image: 'https://example.com/hotel.jpg',
        location: 'Test',
        description: 'Test',
        stars: 6,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with stars < 1', async () => {
      const dto = plainToInstance(CreateHotelDto, {
        name: 'Test',
        image: 'https://example.com/hotel.jpg',
        location: 'Test',
        description: 'Test',
        stars: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── FAQ DTO ─────────────────────────────────────────────────────

  describe('CreateFaqDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateFaqDto, {
        question: 'Test question?',
        answer: 'Test answer.',
        category: 'general',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty question', async () => {
      const dto = plainToInstance(CreateFaqDto, {
        question: '',
        answer: 'Test answer.',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Blog DTO ────────────────────────────────────────────────────

  describe('CreateBlogDto', () => {
    it('should pass with valid data', async () => {
      const dto = plainToInstance(CreateBlogDto, {
        title: 'Test Blog Post',
        content: 'This is the blog content.',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty content', async () => {
      const dto = plainToInstance(CreateBlogDto, {
        title: 'Test',
        content: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
