import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async check() {
    let databaseStatus = 'unknown';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch {
      databaseStatus = 'down';
    }

    return {
      status: 'ok',
      service: 'student-nest-backend',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
      },
    };
  }
}
