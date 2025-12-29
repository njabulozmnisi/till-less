import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaService } from '../common/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const dto = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe(dto.email);
        });
    });

    it('should return 409 for duplicate email', async () => {
      const dto = {
        email: `duplicate-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
      };

      await request(app.getHttpServer()).post('/auth/register').send(dto);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const email = `login-${Date.now()}@example.com`;
      const password = 'password123';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password, name: 'Test' });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'notfound@example.com', password: 'wrong' })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return user profile with valid token', async () => {
      const email = `profile-${Date.now()}@example.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', name: 'Test' });

      const token = registerRes.body.token;

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe(email);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
