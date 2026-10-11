import { Module } from '@nestjs/common';
import { RoommatesService } from './roommates.service.js';
import { RoommatesController } from './roommates.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [RoommatesController],
  providers: [RoommatesService],
  exports: [RoommatesService],
})
export class RoommatesModule {}
