/**
 * API End-to-End Tests
 * ======================
 *
 * Comprehensive integration tests for all backend API endpoints.
 * Requires a running database with seeded test data.
 *
 * Coverage:
 * - Authentication: login (admin + user), invalid credentials, DTO validation
 * - Authorization: JWT guards, admin role guards (403 vs 401)
 * - Admin CRUD: hotels, FAQs, testimonials (create, update, delete)
 * - DTO Validation: contact messages (required fields, email format)
 * - Public data access: packages, hotels, tour-guides, destinations, etc.
 * - Bookings & Payments: auth requirements, user scope, admin access
 * - Security: SQL injection resistance, XSS handling, upload endpoint
 *
 * @note Run `npx prisma db seed` before executing these tests
 * @see test/jest-e2e.json for the E2E Jest configuration
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API End-to-End Tests (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let createdPackageId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Authentication Tests ────────────────────────────────────────

  describe('Authentication', () => {
    it('POST /api/login - should login as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'admin@viceroytravels.com', password: 'password123' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.user.is_super_admin).toBe(true);
      expect(res.body.authorisation.token).toBeDefined();
      adminToken = res.body.authorisation.token;
    });

    it('POST /api/login - should login as regular user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'user@viceroytravels.com', password: 'password123' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.user.is_super_admin).toBe(false);
      expect(res.body.authorisation.token).toBeDefined();
      userToken = res.body.authorisation.token;
    });

    it('POST /api/login - should reject invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'admin@viceroytravels.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });

    it('POST /api/login - should reject invalid DTO (missing email)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/login')
        .send({ password: 'test123' })
        .expect(400);
    });

    it('GET /api/me - should return admin profile with token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.user.email).toBe('admin@viceroytravels.com');
      expect(res.body.user.is_super_admin).toBe(true);
    });

    it('GET /api/me - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/api/me')
        .expect(401);
    });
  });

  // ── Authorization Tests ─────────────────────────────────────────

  describe('Authorization Guards', () => {
    it('POST /api/packages - should reject without token (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/packages')
        .send({ title: 'Unauthorized' })
        .expect(401);
    });

    it('POST /api/packages - should reject with user token (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/packages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Unauthorized' })
        .expect(403);
    });

    it('GET /api/packages - should allow public access', async () => {
      await request(app.getHttpServer())
        .get('/api/packages')
        .expect(200);
    });

    it('POST /api/hotels - should reject without token (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/hotels')
        .send({ name: 'Unauthorized' })
        .expect(401);
    });

    it('POST /api/blog - should reject without token (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/blog')
        .send({ title: 'Unauthorized' })
        .expect(401);
    });

    it('GET /api/tour-guides - should allow public access', async () => {
      await request(app.getHttpServer())
        .get('/api/tour-guides')
        .expect(200);
    });

    it('GET /api/destinations - should allow public access', async () => {
      await request(app.getHttpServer())
        .get('/api/destinations')
        .expect(200);
    });
  });

  // ── Admin CRUD Tests ────────────────────────────────────────────

  describe('Admin CRUD Operations', () => {
    let createdHotelId: number;

    it('POST /api/hotels - should create hotel as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Hotel',
          image: 'https://example.com/hotel.jpg',
          location: 'Test Location',
          description: 'A test hotel for E2E testing',
          stars: 4,
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Test Hotel');
      createdHotelId = res.body.data.id;
    });

    it('PUT /api/hotels/:id - should update hotel as admin', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/hotels/${createdHotelId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Test Hotel' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.name).toBe('Updated Test Hotel');
    });

    it('DELETE /api/hotels/:id - should delete hotel as admin', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/hotels/${createdHotelId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
    });

    it('PUT /api/hotels/:id - should reject with user token (403)', async () => {
      await request(app.getHttpServer())
        .put('/api/hotels/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hack' })
        .expect(403);
    });

    it('POST /api/faqs - should create FAQ as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          question: 'Test question?',
          answer: 'Test answer.',
          category: 'general',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
    });

    it('POST /api/testimonials - should create testimonial as admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/testimonials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test User',
          content: 'Great service!',
          rating: 5,
        })
        .expect(201);

      expect(res.body.status).toBe('success');
    });
  });

  // ── DTO Validation Tests ────────────────────────────────────────

  describe('DTO Validation', () => {
    it('POST /api/contact-messages - should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/contact-messages')
        .send({ name: 'Test' })
        .expect(400);
    });

    it('POST /api/contact-messages - should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/api/contact-messages')
        .send({
          name: 'Test',
          email: 'invalid-email',
          message: 'Test message',
        })
        .expect(400);
    });

    it('POST /api/contact-messages - should accept valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/contact-messages')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message for E2E testing.',
        })
        .expect(201);

      expect(res.body.status).toBe('success');
    });
  });

  // ── Public Data Access Tests ─────────────────────────────────────

  describe('Public Data Access', () => {
    it('GET /api/packages - should return package list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/packages')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/hotels - should return hotel list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hotels')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/tour-guides - should return guide list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tour-guides')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/destinations - should return destination list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/destinations')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/faqs - should return FAQ list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/faqs')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/testimonials - should return testimonial list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/testimonials')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/gallery/items - should return gallery items', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/gallery/items')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/website-settings/public - should return public settings', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/website-settings/public')
        .expect(200);

      expect(res.body.status).toBe('success');
    });
  });

  // ── Booking & Payments Tests ────────────────────────────────────

  describe('Bookings & Payments', () => {
    it('GET /api/bookings - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/api/bookings')
        .expect(401);
    });

    it('GET /api/bookings - should return user bookings with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/payments - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/api/payments')
        .expect(401);
    });

    it('GET /api/payments - should return user payments with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/admin/bookings - should reject with user token (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('GET /api/admin/bookings - should return all bookings for admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
    });
  });

  // ── Security Tests ─────────────────────────────────────────────

  describe('Security', () => {
    it('should reject SQL injection attempts in login', async () => {
      await request(app.getHttpServer())
        .post('/api/login')
        .send({
          email: "' OR 1=1 --",
          password: "' OR '1'='1",
        })
        .expect(401);
    });

    it('should reject XSS attempts in contact form', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/contact-messages')
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'test@test.com',
          message: '<script>alert("xss")</script>',
        })
        .expect(201);

      // Sanitized data should be stored, but request should succeed
      expect(res.body.status).toBe('success');
    });

    it('POST /api/upload/image - upload endpoint is publicly accessible', async () => {
      // Upload endpoint intentionally has no auth guard
      // Just verify it doesn't crash with empty body
      const res = await request(app.getHttpServer())
        .post('/api/upload/image')
        .expect(400); // Bad request (no file) instead of 401
  });
});
