import { Controller, Post, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { JobsService } from './jobs.service.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('status')
  getStatus() {
    return this.jobsService.getStatus();
  }

  @Post('trigger-booking-expiry/:bookingId')
  @HttpCode(HttpStatus.OK)
  triggerBookingExpiry(@Param('bookingId') bookingId: string) {
    return this.jobsService.triggerBookingExpiryNow(bookingId);
  }
}
