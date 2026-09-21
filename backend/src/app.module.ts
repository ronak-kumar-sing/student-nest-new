import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { validateEnv } from './config/env.schema.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ListingsModule } from './modules/listings/listings.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { RoommatesModule } from './modules/roommates/roommates.module.js';
import { ChatModule } from './modules/chat/chat.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env', '.env.local'],
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    SearchModule,
    JobsModule,
    UploadModule,
    RoommatesModule,
    ChatModule,
  ],
})
export class AppModule {}
