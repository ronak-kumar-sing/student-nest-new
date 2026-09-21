import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RoommateRequestStatus } from '@prisma/client';

export interface CreateRoommateRequestDto {
  city: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate?: string;
  bio?: string;
  cleanlinessLevel?: number;
  sleepHabit?: string;
  smokingPreference?: string;
  drinkingPreference?: string;
  foodPreference?: string;
  studyEnvironment?: string;
  roommateGenderPreference?: string;
}

export interface ConnectRoommateDto {
  message?: string;
}

@Injectable()
export class RoommatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create or update a student's active roommate search request */
  async createRequest(studentId: string, dto: CreateRoommateRequestDto) {
    // Close any existing active requests first
    await this.prisma.roommateRequest.updateMany({
      where: { studentId, status: RoommateRequestStatus.ACTIVE },
      data: { status: RoommateRequestStatus.CLOSED },
    });

    return this.prisma.roommateRequest.create({
      data: {
        studentId,
        city: dto.city,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        bio: dto.bio,
        cleanlinessLevel: dto.cleanlinessLevel ?? 3,
        sleepHabit: dto.sleepHabit ?? 'NORMAL',
        smokingPreference: dto.smokingPreference ?? 'NON_SMOKER',
        drinkingPreference: dto.drinkingPreference ?? 'NON_DRINKER',
        foodPreference: dto.foodPreference ?? 'ANY',
        studyEnvironment: dto.studyEnvironment ?? 'QUIET',
        roommateGenderPreference: dto.roommateGenderPreference ?? 'SAME_GENDER',
      },
    });
  }

  /** Get the current student's active requests */
  async getMyRequests(studentId: string) {
    return this.prisma.roommateRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find compatible roommate matches for a student.
   * Algorithm: weighted compatibility score on lifestyle dimensions.
   */
  async getMatches(studentId: string, city?: string) {
    // Find own active request
    const myRequest = await this.prisma.roommateRequest.findFirst({
      where: { studentId, status: RoommateRequestStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    if (!myRequest) {
      throw new BadRequestException('Create a roommate search request first to see matches');
    }

    // Fetch all other active requests in the same city
    const otherRequests = await this.prisma.roommateRequest.findMany({
      where: {
        status: RoommateRequestStatus.ACTIVE,
        studentId: { not: studentId },
        city: city || myRequest.city,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                fullName: true,
                collegeName: true,
                city: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    // Calculate compatibility scores
    const matches = otherRequests.map((other) => {
      const score = this.calculateCompatibility(myRequest, other);
      return {
        request: other,
        compatibilityScore: score,
        compatibilityPercent: Math.round(score * 100),
        matchTags: this.getMatchTags(myRequest, other),
      };
    });

    // Sort by score descending
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
      myRequest,
      matches,
      total: matches.length,
    };
  }

  /**
   * Send a connection request to another student.
   */
  async sendConnect(fromStudentId: string, toRequestId: string, dto: ConnectRoommateDto) {
    const fromRequest = await this.prisma.roommateRequest.findFirst({
      where: { studentId: fromStudentId, status: RoommateRequestStatus.ACTIVE },
    });

    if (!fromRequest) {
      throw new BadRequestException('You must have an active roommate request to connect');
    }

    const toRequest = await this.prisma.roommateRequest.findUnique({
      where: { id: toRequestId },
    });

    if (!toRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    if (toRequest.studentId === fromStudentId) {
      throw new BadRequestException('You cannot connect to your own request');
    }

    // Check if already connected
    const existing = await this.prisma.roommateConnect.findUnique({
      where: {
        fromRequestId_toRequestId: {
          fromRequestId: fromRequest.id,
          toRequestId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Connection request already sent');
    }

    return this.prisma.roommateConnect.create({
      data: {
        fromRequestId: fromRequest.id,
        toRequestId,
        message: dto.message,
      },
    });
  }

  /**
   * Get all incoming connection requests for the current user.
   */
  async getIncomingConnects(studentId: string) {
    const myRequests = await this.prisma.roommateRequest.findMany({
      where: { studentId },
      select: { id: true },
    });

    const myRequestIds = myRequests.map((r) => r.id);

    return this.prisma.roommateConnect.findMany({
      where: { toRequestId: { in: myRequestIds } },
      include: {
        fromRequest: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                studentProfile: { select: { fullName: true, collegeName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Accept or decline a connection request.
   */
  async respondToConnect(connectId: string, studentId: string, accept: boolean) {
    const connect = await this.prisma.roommateConnect.findUnique({
      where: { id: connectId },
      include: {
        toRequest: true,
      },
    });

    if (!connect) throw new NotFoundException('Connection request not found');
    if (connect.toRequest.studentId !== studentId) {
      throw new ForbiddenException('Not authorized to respond to this request');
    }

    return this.prisma.roommateConnect.update({
      where: { id: connectId },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
    });
  }

  // -----------------------------------------------
  // Private: Compatibility Algorithm
  // -----------------------------------------------

  private calculateCompatibility(a: any, b: any): number {
    let score = 0;
    let maxScore = 0;

    // Budget overlap (weight: 2)
    const budgetOverlap = Math.min(a.budgetMax, b.budgetMax) - Math.max(a.budgetMin, b.budgetMin);
    maxScore += 2;
    if (budgetOverlap >= 0) {
      const overlapRatio = budgetOverlap / Math.max(a.budgetMax - a.budgetMin, 1);
      score += 2 * Math.min(1, overlapRatio + 0.3);
    }

    // Sleep habit (weight: 2)
    maxScore += 2;
    if (a.sleepHabit === b.sleepHabit) score += 2;
    else if (a.sleepHabit === 'NORMAL' || b.sleepHabit === 'NORMAL') score += 1;

    // Cleanliness (weight: 1.5)
    maxScore += 1.5;
    const cleanDiff = Math.abs(a.cleanlinessLevel - b.cleanlinessLevel);
    score += 1.5 * Math.max(0, 1 - cleanDiff / 4);

    // Smoking (weight: 2)
    maxScore += 2;
    if (a.smokingPreference === b.smokingPreference) score += 2;

    // Drinking (weight: 1.5)
    maxScore += 1.5;
    if (a.drinkingPreference === b.drinkingPreference) score += 1.5;
    else if (a.drinkingPreference === 'ANY' || b.drinkingPreference === 'ANY') score += 0.75;

    // Food (weight: 1)
    maxScore += 1;
    if (a.foodPreference === b.foodPreference) score += 1;
    else if (a.foodPreference === 'ANY' || b.foodPreference === 'ANY') score += 0.5;

    // Study environment (weight: 1.5)
    maxScore += 1.5;
    if (a.studyEnvironment === b.studyEnvironment) score += 1.5;

    // Gender preference (weight: 2)
    maxScore += 2;
    if (
      a.roommateGenderPreference === 'ANY' ||
      b.roommateGenderPreference === 'ANY' ||
      a.roommateGenderPreference === b.roommateGenderPreference
    ) {
      score += 2;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  private getMatchTags(a: any, b: any): string[] {
    const tags: string[] = [];

    const budgetOverlap = Math.min(a.budgetMax, b.budgetMax) - Math.max(a.budgetMin, b.budgetMin);
    if (budgetOverlap >= 0) tags.push('Budget Compatible');
    if (a.sleepHabit === b.sleepHabit) tags.push(`${a.sleepHabit.replace('_', ' ')} Schedule`);
    if (a.smokingPreference === b.smokingPreference && a.smokingPreference === 'NON_SMOKER')
      tags.push('Non-Smoker');
    if (a.studyEnvironment === b.studyEnvironment)
      tags.push(`${a.studyEnvironment.replace('_', ' ')} Study`);
    if (a.foodPreference === b.foodPreference && a.foodPreference !== 'ANY')
      tags.push(a.foodPreference.replace('_', ' '));
    if (Math.abs(a.cleanlinessLevel - b.cleanlinessLevel) <= 1) tags.push('Similar Cleanliness');

    return tags;
  }
}
