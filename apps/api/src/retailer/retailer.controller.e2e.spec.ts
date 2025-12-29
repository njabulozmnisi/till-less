import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';
import { PrismaService } from '../common/prisma.service';

describe('RetailerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let createdRetailerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: '$2b$10$test', // hashed password
        name: 'Admin User',
        roles: ['ADMIN'],
      },
    });

    // Create test regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        password: '$2b$10$test',
        name: 'Regular User',
        roles: ['USER'],
      },
    });

    // Mock getting tokens (in real scenario, call auth endpoints)
    adminToken = 'mock-admin-jwt-token';
    userToken = 'mock-user-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.retailer.deleteMany({
      where: { slug: { startsWith: 'test-' } },
    });
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@test.com' } },
    });
    await app.close();
  });

  describe('GET /retailers', () => {
    it('should return all retailers (public)', () => {
      return request(app.getHttpServer())
        .get('/retailers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /retailers/:id', () => {
    it('should return a retailer by id', async () => {
      const retailer = await prisma.retailer.create({
        data: {
          slug: 'test-retailer-get',
          name: 'Test Retailer',
          displayName: 'Test Display',
        },
      });

      return request(app.getHttpServer())
        .get(`/retailers/${retailer.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(retailer.id);
          expect(res.body.slug).toBe('test-retailer-get');
        });
    });

    it('should return 404 for non-existent retailer', () => {
      return request(app.getHttpServer())
        .get('/retailers/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /retailers', () => {
    it('should create a retailer with admin auth', () => {
      return request(app.getHttpServer())
        .post('/retailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-create',
          name: 'Test Create',
          displayName: 'Test Create Display',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.slug).toBe('test-create');
          createdRetailerId = res.body.id;
        });
    });

    it('should reject creation without admin role', () => {
      return request(app.getHttpServer())
        .post('/retailers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          slug: 'test-forbidden',
          name: 'Test Forbidden',
          displayName: 'Test Forbidden Display',
        })
        .expect(403);
    });

    it('should reject creation without authentication', () => {
      return request(app.getHttpServer())
        .post('/retailers')
        .send({
          slug: 'test-unauth',
          name: 'Test Unauth',
          displayName: 'Test Unauth Display',
        })
        .expect(401);
    });

    it('should reject invalid data (missing required fields)', () => {
      return request(app.getHttpServer())
        .post('/retailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-invalid',
          // missing name and displayName
        })
        .expect(400);
    });

    it('should reject invalid email format', () => {
      return request(app.getHttpServer())
        .post('/retailers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-email',
          name: 'Test Email',
          displayName: 'Test Email Display',
          supportEmail: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('PATCH /retailers/:id', () => {
    it('should update a retailer with admin auth', async () => {
      const retailer = await prisma.retailer.create({
        data: {
          slug: 'test-update',
          name: 'Test Update',
          displayName: 'Test Update Display',
        },
      });

      return request(app.getHttpServer())
        .patch(`/retailers/${retailer.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.slug).toBe('test-update'); // unchanged
        });
    });

    it('should reject update without admin role', async () => {
      const retailer = await prisma.retailer.create({
        data: {
          slug: 'test-update-forbidden',
          name: 'Test',
          displayName: 'Test',
        },
      });

      return request(app.getHttpServer())
        .patch(`/retailers/${retailer.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' })
        .expect(403);
    });
  });

  describe('DELETE /retailers/:id', () => {
    it('should soft delete a retailer with admin auth', async () => {
      const retailer = await prisma.retailer.create({
        data: {
          slug: 'test-delete',
          name: 'Test Delete',
          displayName: 'Test Delete Display',
          isActive: true,
        },
      });

      return request(app.getHttpServer())
        .delete(`/retailers/${retailer.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should reject delete without admin role', async () => {
      const retailer = await prisma.retailer.create({
        data: {
          slug: 'test-delete-forbidden',
          name: 'Test',
          displayName: 'Test',
        },
      });

      return request(app.getHttpServer())
        .delete(`/retailers/${retailer.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
