import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { vi } from 'vitest';
import { AppModule } from './../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Application API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const mockPrisma = {
      $connect: vi.fn().mockResolvedValue(undefined),
      $disconnect: vi.fn().mockResolvedValue(undefined),
      $queryRaw: vi.fn().mockResolvedValue([{ '1': 1 }]),
      listing: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) should return 200 with standard success envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('service', 'student-nest-backend');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('path', '/api/v1/health');
  });

  it('/api/v1/listings/search (GET) should return 200 with listings array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/listings/search')
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('listings');
    expect(Array.isArray(res.body.data.listings)).toBe(true);
    expect(res.body.data).toHaveProperty('total');
  });

  it('/api/v1/unknown-route (GET) should return 404 with standard error envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/unknown-route')
      .expect(404);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('data', null);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('statusCode', 404);
    expect(res.body.error).toHaveProperty('timestamp');
  });
});
