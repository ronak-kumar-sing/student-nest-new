import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { BookingExpiryProcessor } from './processors/booking-expiry.processor.js';

@Module({
  controllers: [JobsController],
  providers: [JobsService, BookingExpiryProcessor],
  exports: [JobsService, BookingExpiryProcessor],
})
export class JobsModule {}
