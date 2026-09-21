import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  RoommatesService,
} from './roommates.service.js';
import type {
  CreateRoommateRequestDto,
  ConnectRoommateDto,
} from './roommates.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@Controller('roommates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoommatesController {
  constructor(private readonly roommatesService: RoommatesService) {}

  /** POST /roommates/request — Create a roommate search request */
  @Post('request')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRoommateRequestDto,
  ) {
    return this.roommatesService.createRequest(user.userId, dto);
  }

  /** GET /roommates/my-requests — My active/closed requests */
  @Get('my-requests')
  @Roles(Role.STUDENT)
  getMyRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.roommatesService.getMyRequests(user.userId);
  }

  /** GET /roommates/matches?city=Pune — Get compatible matches */
  @Get('matches')
  @Roles(Role.STUDENT)
  getMatches(
    @CurrentUser() user: AuthenticatedUser,
    @Query('city') city?: string,
  ) {
    return this.roommatesService.getMatches(user.userId, city);
  }

  /** GET /roommates/connects — Incoming connection requests */
  @Get('connects')
  @Roles(Role.STUDENT)
  getIncomingConnects(@CurrentUser() user: AuthenticatedUser) {
    return this.roommatesService.getIncomingConnects(user.userId);
  }

  /** POST /roommates/:requestId/connect — Send connection interest */
  @Post(':requestId/connect')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  sendConnect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('requestId') requestId: string,
    @Body() dto: ConnectRoommateDto,
  ) {
    return this.roommatesService.sendConnect(user.userId, requestId, dto);
  }

  /** PATCH /roommates/connects/:id/respond?accept=true */
  @Patch('connects/:id/respond')
  @Roles(Role.STUDENT)
  respondToConnect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('accept') accept: string,
  ) {
    return this.roommatesService.respondToConnect(id, user.userId, accept === 'true');
  }
}
