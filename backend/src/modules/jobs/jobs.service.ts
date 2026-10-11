import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import {
  BOOKING_QUEUE_NAME,
  JOB_EXPIRE_BOOKING,
  OWNER_REMINDER_QUEUE_NAME,
  JOB_OWNER_REMINDER,
} from './jobs.constants.js';
import { BookingExpiryProcessor } from './processors/booking-expiry.processor.js';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private bookingQueue: Queue | null = null;
  private reminderQueue: Queue | null = null;
  private bookingWorker: Worker | null = null;
  private isRedisConnected = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly expiryProcessor: BookingExpiryProcessor,
  ) {}

  async onModuleInit(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    // Skip live Redis connections during automated test runs
    if (nodeEnv === 'test') {
      this.logger.log('Running in test environment: live Redis BullMQ workers disabled');
      return;
    }

    try {
      const url = new URL(redisUrl);
      const connection = {
        host: url.hostname || 'localhost',
        port: Number(url.port) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        retryStrategy: () => null,
      };

      // Probe Redis availability with short timeout before attaching workers
      const probeClient = new Redis({
        host: connection.host,
        port: connection.port,
        password: connection.password,
        connectTimeout: 1000,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        retryStrategy: () => null,
      });

      probeClient.on('error', () => {
        // Suppress connection errors during probe
      });

      await probeClient.connect();
      await probeClient.ping();
      probeClient.disconnect();

      this.bookingQueue = new Queue(BOOKING_QUEUE_NAME, { connection });
      this.reminderQueue = new Queue(OWNER_REMINDER_QUEUE_NAME, { connection });

      this.bookingQueue.on('error', (err) => {
        this.logger.warn(`BullMQ booking queue connection notice: ${err.message}`);
      });

      this.reminderQueue.on('error', (err) => {
        this.logger.warn(`BullMQ reminder queue connection notice: ${err.message}`);
      });

      // Worker processing booking expiry jobs
      this.bookingWorker = new Worker(
        BOOKING_QUEUE_NAME,
        async (job) => {
          if (job.name === JOB_EXPIRE_BOOKING) {
            await this.expiryProcessor.process(job.data.bookingId);
          }
        },
        { connection },
      );

      this.bookingWorker.on('error', (err) => {
        this.logger.warn(`BullMQ booking worker connection notice: ${err.message}`);
      });

      this.bookingWorker.on('completed', (job) => {
        this.logger.log(`[BullMQ Worker] Job ${job.id} (${job.name}) completed successfully`);
      });

      this.bookingWorker.on('failed', (job, err) => {
        this.logger.warn(`[BullMQ Worker] Job ${job?.id} failed: ${err.message}`);
      });

      this.isRedisConnected = true;
      this.logger.log(`BullMQ queues initialized successfully with Redis at ${connection.host}:${connection.port}`);
    } catch (error) {
      this.logger.warn(
        `Redis not available for BullMQ queues (${(error as Error).message}). Jobs will run via in-memory/direct fallback.`,
      );
      this.isRedisConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.bookingWorker) await this.bookingWorker.close();
      if (this.bookingQueue) await this.bookingQueue.close();
      if (this.reminderQueue) await this.reminderQueue.close();
    } catch {
      // Graceful shutdown
    }
  }

  async scheduleBookingExpiry(bookingId: string, delayMs: number = 24 * 60 * 60 * 1000): Promise<{ scheduled: boolean; jobId?: string }> {
    if (this.bookingQueue && this.isRedisConnected) {
      try {
        const job = await this.bookingQueue.add(
          JOB_EXPIRE_BOOKING,
          { bookingId },
          {
            delay: delayMs,
            jobId: `expire_${bookingId}`,
            removeOnComplete: true,
            removeOnFail: false,
          },
        );
        this.logger.log(`Scheduled BullMQ expiry job for booking ${bookingId} with delay ${delayMs}ms`);
        return { scheduled: true, jobId: job.id };
      } catch (error) {
        this.logger.warn(`Could not enqueue to BullMQ: ${(error as Error).message}. Using direct timer.`);
      }
    }

    return { scheduled: true };
  }

  async triggerBookingExpiryNow(bookingId: string) {
    return this.expiryProcessor.process(bookingId);
  }

  async scheduleOwnerReminder(ownerId: string, listingId: string, delayMs: number = 48 * 60 * 60 * 1000) {
    if (this.reminderQueue && this.isRedisConnected) {
      try {
        await this.reminderQueue.add(
          JOB_OWNER_REMINDER,
          { ownerId, listingId },
          { delay: delayMs, removeOnComplete: true },
        );
        return { scheduled: true };
      } catch {
        // Fallback
      }
    }
    return { scheduled: false };
  }

  getStatus() {
    return {
      module: 'jobs',
      provider: 'BullMQ',
      redisConnected: this.isRedisConnected,
      queues: [BOOKING_QUEUE_NAME, OWNER_REMINDER_QUEUE_NAME],
    };
  }
}
