import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RoommateRequestStatus, RoommateConnectStatus } from '@prisma/client';

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
  hasRoom?: boolean;
  roomDetails?: any;
}

export interface ConnectRoommateDto {
  message?: string;
}

export interface InMemoryRoommateRequest {
  id: string;
  studentId: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate?: Date | null;
  bio?: string | null;
  status: RoommateRequestStatus;
  cleanlinessLevel: number;
  sleepHabit: string;
  smokingPreference: string;
  drinkingPreference: string;
  foodPreference: string;
  studyEnvironment: string;
  roommateGenderPreference: string;
  hasRoom?: boolean;
  room?: any;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    email: string;
    studentProfile?: {
      fullName: string;
      collegeName?: string;
      city?: string;
      bio?: string;
      avatar?: string;
      isPhoneVerified?: boolean;
      isAadhaarVerified?: boolean;
    };
  };
}

export interface InMemoryRoommateConnect {
  id: string;
  fromRequestId: string;
  toRequestId: string;
  status: RoommateConnectStatus;
  message?: string | null;
  createdAt: Date;
  updatedAt: Date;
  fromRequest?: InMemoryRoommateRequest;
  toRequest?: InMemoryRoommateRequest;
}

// -------------------------------------------------------------
// PRE-SEEDED IN-MEMORY STUDENT ROOMMATE PROFILES
// -------------------------------------------------------------
const INITIAL_ROOMMATE_REQUESTS: InMemoryRoommateRequest[] = [
  {
    id: 'req-priya-pune',
    studentId: 'stud-priya',
    city: 'Pune',
    budgetMin: 8000,
    budgetMax: 15000,
    cleanlinessLevel: 5,
    sleepHabit: 'NIGHT_OWL',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'NON_DRINKER',
    foodPreference: 'VEG',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'SAME_GENDER',
    bio: 'Masters student in Data Science. Quiet during exam weeks, love exploring cafes on weekends, clean and respectful.',
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-01T10:00:00Z'),
    updatedAt: new Date('2026-02-01T10:00:00Z'),
    student: {
      id: 'stud-priya',
      email: 'priya.sharma@hansraj.du.ac.in',
      studentProfile: {
        fullName: 'Priya Sharma',
        collegeName: 'Hansraj College / Pune University',
        city: 'Pune',
        bio: 'M.Sc Data Science scholar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
  {
    id: 'req-ananya-pune',
    studentId: 'stud-ananya',
    city: 'Pune',
    budgetMin: 7000,
    budgetMax: 13500,
    cleanlinessLevel: 4,
    sleepHabit: 'NORMAL',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'NON_DRINKER',
    foodPreference: 'VEG',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'SAME_GENDER',
    bio: 'Literature major at Fergusson. Reading enthusiast, vegetarian cook, looking to share a bright apartment near FC Road.',
    hasRoom: true,
    room: {
      id: 'room-ananya-fergusson',
      title: 'Cozy Bohemian Studio Room in 3BHK Heritage Flat',
      roomType: 'Private Room with Garden View',
      rentShare: 9000,
      currency: '₹',
      deposit: 18000,
      address: 'Fergusson College Road, Shivajinagar',
      neighborhood: 'FC Road',
      city: 'Pune',
      distanceToCampus: '300m walk to Fergusson College',
      furnishing: 'Fully Furnished (Bookshelf, Wooden Desk, Single Bed, Wardrobe)',
      images: [
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502005229762-ae1b4653dd20?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['High-speed WiFi', 'Modular Kitchen', 'Quiet Study Nook', 'RO Water Purifier', 'Balcony Garden'],
      availableFrom: '1st of Next Month',
      coordinates: { lat: 18.5244, lng: 73.8407 }
    },
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-05T12:00:00Z'),
    updatedAt: new Date('2026-02-05T12:00:00Z'),
    student: {
      id: 'stud-ananya',
      email: 'ananya.iyer@fergusson.edu',
      studentProfile: {
        fullName: 'Ananya Iyer',
        collegeName: 'Fergusson College Pune',
        city: 'Pune',
        bio: 'Literature & Philosophy major',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
  {
    id: 'req-rohit-pune',
    studentId: 'stud-rohit',
    city: 'Pune',
    budgetMin: 7000,
    budgetMax: 14000,
    cleanlinessLevel: 4,
    sleepHabit: 'NORMAL',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'NON_DRINKER',
    foodPreference: 'ANY',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'ANY',
    bio: 'Mechanical Engineering grad student at COEP. Organized, hygienic, looking for friendly roommate to split 2BHK.',
    hasRoom: true,
    room: {
      id: 'room-rohit-coep',
      title: 'Sunlit Private Master Bedroom in Modern 2BHK',
      roomType: 'Private Room in 2BHK',
      rentShare: 8500,
      currency: '₹',
      deposit: 15000,
      address: 'Lane 4, Prabhat Road, Deccan Gymkhana',
      neighborhood: 'Deccan / FC Road',
      city: 'Pune',
      distanceToCampus: '0.8 km to COEP / BMCC',
      furnishing: 'Fully Furnished (Queen Bed, Ergonomic Study Table, Wardrobe, AC)',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['1 Gbps Fiber WiFi', 'Balcony with Greenery', 'Washing Machine', 'Cook / Maid Available', 'Geyser', 'Attached Washroom'],
      availableFrom: 'Immediate Move-in',
      coordinates: { lat: 18.5167, lng: 73.8415 }
    },
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-08T09:00:00Z'),
    updatedAt: new Date('2026-02-08T09:00:00Z'),
    student: {
      id: 'stud-rohit',
      email: 'rohit.deshmukh@coep.ac.in',
      studentProfile: {
        fullName: 'Rohit Deshmukh',
        collegeName: 'COEP Technological University',
        city: 'Pune',
        bio: 'M.Tech Mechanical',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
  {
    id: 'req-kunal-delhi',
    studentId: 'stud-kunal',
    city: 'Delhi',
    budgetMin: 10000,
    budgetMax: 18000,
    cleanlinessLevel: 4,
    sleepHabit: 'EARLY_BIRD',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'SOCIAL_DRINKER',
    foodPreference: 'ANY',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'ANY',
    bio: 'CS senior at IIT Delhi. Clean habits, quiet study hours on weekdays, into badminton on weekends. Looking to share near Hauz Khas.',
    hasRoom: true,
    room: {
      id: 'room-kunal-iitd',
      title: 'Spacious Airy Room in 3BHK Hauz Khas Enclave',
      roomType: 'Private Room with Attached Bath',
      rentShare: 12000,
      currency: '₹',
      deposit: 24000,
      address: 'Hauz Khas Enclave, Near Metro Gate 2',
      neighborhood: 'Hauz Khas / IIT Flyover',
      city: 'Delhi',
      distanceToCampus: '1.2 km to IIT Delhi Main Gate',
      furnishing: 'Semi-Furnished (AC, Wardrobe, Bed with Mattress, Study Desk)',
      images: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Power Backup 24/7', 'High-Speed WiFi', 'Balcony', 'Gated Society with Security', 'Gym in Complex'],
      availableFrom: 'Immediate Move-in',
      coordinates: { lat: 28.5494, lng: 77.1995 }
    },
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-10T14:00:00Z'),
    updatedAt: new Date('2026-02-10T14:00:00Z'),
    student: {
      id: 'stud-kunal',
      email: 'kunal.v@iitd.ac.in',
      studentProfile: {
        fullName: 'Kunal Verma',
        collegeName: 'IIT Delhi (Computer Science)',
        city: 'Delhi',
        bio: 'B.Tech CS Senior',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
  {
    id: 'req-maya-cambridge',
    studentId: 'stud-maya',
    city: 'Cambridge',
    budgetMin: 1400,
    budgetMax: 2200,
    cleanlinessLevel: 5,
    sleepHabit: 'NORMAL',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'SOCIAL_DRINKER',
    foodPreference: 'VEGAN',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'ANY',
    bio: 'MIT Media Lab researcher. Quiet, focused scholar looking for an architectural apartment near Kendall Square.',
    hasRoom: true,
    room: {
      id: 'room-maya-mit',
      title: 'Architectural Kendall Loft — Private Bedroom + Dedicated Workspace',
      roomType: 'Private Suite in 2-Bed Designer Loft',
      rentShare: 1450,
      currency: '$',
      deposit: 1450,
      address: 'Broadway & Kendall St',
      neighborhood: 'Kendall Square',
      city: 'Cambridge',
      distanceToCampus: '4 mins walk to MIT Stata Center',
      furnishing: 'Designer Furnished (Standing Desk, Ergonomic Chair, Queen Bed)',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['1 Gbps Fiber', 'In-Unit Laundry', 'Acoustic Soundproofing', 'Espresso Bar', 'Subway Access'],
      availableFrom: 'Fall Semester',
      listingId: 'nest-103',
      coordinates: { lat: 42.3629, lng: -71.0840 }
    },
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-12T11:00:00Z'),
    updatedAt: new Date('2026-02-12T11:00:00Z'),
    student: {
      id: 'stud-maya',
      email: 'maya.lin@mit.edu',
      studentProfile: {
        fullName: 'Maya Lin',
        collegeName: 'MIT Media Lab',
        city: 'Cambridge',
        bio: 'Design & Computation Fellow',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
  {
    id: 'req-aravind-bangalore',
    studentId: 'stud-aravind',
    city: 'Bangalore',
    budgetMin: 9000,
    budgetMax: 16000,
    cleanlinessLevel: 4,
    sleepHabit: 'EARLY_BIRD',
    smokingPreference: 'NON_SMOKER',
    drinkingPreference: 'NON_DRINKER',
    foodPreference: 'VEG',
    studyEnvironment: 'QUIET',
    roommateGenderPreference: 'ANY',
    bio: 'PhD scholar at IISc Bangalore. Non-interfering, neat, disciplined morning routine.',
    status: RoommateRequestStatus.ACTIVE,
    createdAt: new Date('2026-02-14T08:00:00Z'),
    updatedAt: new Date('2026-02-14T08:00:00Z'),
    student: {
      id: 'stud-aravind',
      email: 'aravind.k@iisc.ac.in',
      studentProfile: {
        fullName: 'Aravind Kumar',
        collegeName: 'IISc Bangalore',
        city: 'Bangalore',
        bio: 'Computational Physics PhD',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        isPhoneVerified: true,
        isAadhaarVerified: true,
      },
    },
  },
];

@Injectable()
export class RoommatesService {
  private readonly logger = new Logger(RoommatesService.name);

  // In-memory data store for resilience when Postgres is offline
  private inMemoryRequests: InMemoryRoommateRequest[] = [...INITIAL_ROOMMATE_REQUESTS];
  private inMemoryConnects: InMemoryRoommateConnect[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.seedDefaultConnects();
  }

  private seedDefaultConnects() {
    const priyaReq = this.inMemoryRequests.find((r) => r.id === 'req-priya-pune');
    const kunalReq = this.inMemoryRequests.find((r) => r.id === 'req-kunal-delhi');

    if (priyaReq) {
      this.inMemoryConnects.push({
        id: 'conn_demo_priya',
        fromRequestId: priyaReq.id,
        toRequestId: 'req-student-demo-default',
        status: RoommateConnectStatus.PENDING,
        message: 'Hey! Saw our sleep schedule (night owl) and vegetarian food preference match 94%. Looking for a 2BHK near campus, would love to team up!',
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2),
        fromRequest: priyaReq,
      });
    }

    if (kunalReq) {
      this.inMemoryConnects.push({
        id: 'conn_demo_kunal',
        fromRequestId: kunalReq.id,
        toRequestId: 'req-student-demo-default',
        status: RoommateConnectStatus.PENDING,
        message: 'Hi! Clean habits, quiet study hours on weekdays, and into badminton on weekends. Looking to share an apartment near campus.',
        createdAt: new Date(Date.now() - 3600000 * 7),
        updatedAt: new Date(Date.now() - 3600000 * 7),
        fromRequest: kunalReq,
      });
    }
  }

  /** Create or update a student's active roommate search request */
  async createRequest(studentId: string, dto: CreateRoommateRequestDto) {
    try {
      // Close any existing active requests first
      await this.prisma.roommateRequest.updateMany({
        where: { studentId, status: RoommateRequestStatus.ACTIVE },
        data: { status: RoommateRequestStatus.CLOSED },
      });

      return await this.prisma.roommateRequest.create({
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
    } catch (err: any) {
      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for createRequest.`);
      
      // Close existing in-memory active requests for this student
      this.inMemoryRequests.forEach((r) => {
        if (r.studentId === studentId && r.status === RoommateRequestStatus.ACTIVE) {
          r.status = RoommateRequestStatus.CLOSED;
          r.updatedAt = new Date();
        }
      });

      const newReq: InMemoryRoommateRequest = {
        id: `req-${studentId}-${Date.now()}`,
        studentId,
        city: dto.city,
        budgetMin: Number(dto.budgetMin),
        budgetMax: Number(dto.budgetMax),
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : null,
        bio: dto.bio || '',
        cleanlinessLevel: Number(dto.cleanlinessLevel ?? 3),
        sleepHabit: dto.sleepHabit ?? 'NORMAL',
        smokingPreference: dto.smokingPreference ?? 'NON_SMOKER',
        drinkingPreference: dto.drinkingPreference ?? 'NON_DRINKER',
        foodPreference: dto.foodPreference ?? 'ANY',
        studyEnvironment: dto.studyEnvironment ?? 'QUIET',
        roommateGenderPreference: dto.roommateGenderPreference ?? 'SAME_GENDER',
        status: RoommateRequestStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        student: {
          id: studentId,
          email: `${studentId}@studentnest.demo`,
          studentProfile: {
            fullName: 'Student Scholar',
            collegeName: 'StudentNest University',
            city: dto.city,
            bio: dto.bio,
          },
        },
      };

      this.inMemoryRequests.unshift(newReq);
      return newReq;
    }
  }

  /** Get the current student's active requests */
  async getMyRequests(studentId: string) {
    try {
      return await this.prisma.roommateRequest.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for getMyRequests.`);
      const myReqs = this.inMemoryRequests.filter((r) => r.studentId === studentId);
      if (myReqs.length > 0) return myReqs;

      // Provide initial default active request for standard demo user so they can view matches immediately
      if (studentId === 'usr-student-demo' || studentId.includes('student')) {
        const demoReq: InMemoryRoommateRequest = {
          id: 'req-student-demo-default',
          studentId,
          city: 'Pune',
          budgetMin: 6000,
          budgetMax: 15000,
          cleanlinessLevel: 4,
          sleepHabit: 'NORMAL',
          smokingPreference: 'NON_SMOKER',
          drinkingPreference: 'NON_DRINKER',
          foodPreference: 'ANY',
          studyEnvironment: 'QUIET',
          roommateGenderPreference: 'SAME_GENDER',
          bio: 'Graduate scholar at Harvard / StudentNest. Looking for compatible student roommate.',
          status: RoommateRequestStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
          student: {
            id: studentId,
            email: 'student@studentnest.demo',
            studentProfile: {
              fullName: 'Julian Chen',
              collegeName: 'Harvard Graduate School',
              city: 'Pune',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            },
          },
        };
        this.inMemoryRequests.unshift(demoReq);
        return [demoReq];
      }

      return [];
    }
  }

  /**
   * Find compatible roommate matches for a student.
   * Algorithm: weighted compatibility score on lifestyle dimensions.
   */
  async getMatches(studentId: string, city?: string) {
    try {
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

      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      return {
        myRequest,
        matches,
        total: matches.length,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        // In fallback mode, auto-check if in-memory request exists or build sensible defaults
        const inMemMyReq = this.inMemoryRequests.find(
          (r) => r.studentId === studentId && r.status === RoommateRequestStatus.ACTIVE,
        );
        if (!inMemMyReq) {
          throw err;
        }
      }

      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for getMatches.`);
      return this.getInMemoryMatches(studentId, city);
    }
  }

  private getInMemoryMatches(studentId: string, city?: string) {
    let myRequest = this.inMemoryRequests.find(
      (r) => r.studentId === studentId && r.status === RoommateRequestStatus.ACTIVE,
    );

    if (!myRequest) {
      // Auto-create default request for seamless preview
      myRequest = {
        id: `req-${studentId}-active`,
        studentId,
        city: city || 'Pune',
        budgetMin: 6000,
        budgetMax: 15000,
        cleanlinessLevel: 4,
        sleepHabit: 'NORMAL',
        smokingPreference: 'NON_SMOKER',
        drinkingPreference: 'NON_DRINKER',
        foodPreference: 'ANY',
        studyEnvironment: 'QUIET',
        roommateGenderPreference: 'SAME_GENDER',
        status: RoommateRequestStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryRequests.unshift(myRequest);
    }

    const targetCity = city || myRequest.city;
    let candidateRequests = this.inMemoryRequests.filter(
      (r) => r.status === RoommateRequestStatus.ACTIVE && r.studentId !== studentId,
    );

    // Filter by city if matches exist in that city, otherwise expand to all cities
    const cityMatches = candidateRequests.filter(
      (r) => r.city.toLowerCase() === targetCity.toLowerCase(),
    );
    if (cityMatches.length > 0) {
      candidateRequests = cityMatches;
    }

    const matches = candidateRequests.map((other) => {
      const score = this.calculateCompatibility(myRequest, other);
      return {
        request: other,
        compatibilityScore: score,
        compatibilityPercent: Math.max(50, Math.round(score * 100)),
        matchTags: this.getMatchTags(myRequest, other),
      };
    });

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return {
      myRequest,
      matches,
      total: matches.length,
      source: 'in-memory-fallback',
    };
  }

  /** Send a connection request to another student */
  async sendConnect(fromStudentId: string, toRequestId: string, dto: ConnectRoommateDto) {
    try {
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

      return await this.prisma.roommateConnect.create({
        data: {
          fromRequestId: fromRequest.id,
          toRequestId,
          message: dto.message,
        },
      });
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        // Check if exists in memory before rethrowing
        const inMemFromReq = this.inMemoryRequests.find(
          (r) => r.studentId === fromStudentId && r.status === RoommateRequestStatus.ACTIVE,
        );
        const inMemToReq = this.inMemoryRequests.find((r) => r.id === toRequestId);
        if (inMemFromReq && inMemToReq) {
          return this.sendInMemoryConnect(fromStudentId, toRequestId, dto);
        }
        throw err;
      }

      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for sendConnect.`);
      return this.sendInMemoryConnect(fromStudentId, toRequestId, dto);
    }
  }

  private sendInMemoryConnect(fromStudentId: string, toRequestId: string, dto: ConnectRoommateDto) {
    let fromRequest = this.inMemoryRequests.find(
      (r) => r.studentId === fromStudentId && r.status === RoommateRequestStatus.ACTIVE,
    );

    if (!fromRequest) {
      // Auto-create default request
      fromRequest = {
        id: `req-${fromStudentId}-auto`,
        studentId: fromStudentId,
        city: 'Pune',
        budgetMin: 6000,
        budgetMax: 15000,
        cleanlinessLevel: 4,
        sleepHabit: 'NORMAL',
        smokingPreference: 'NON_SMOKER',
        drinkingPreference: 'NON_DRINKER',
        foodPreference: 'ANY',
        studyEnvironment: 'QUIET',
        roommateGenderPreference: 'SAME_GENDER',
        status: RoommateRequestStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryRequests.push(fromRequest);
    }

    const toRequest = this.inMemoryRequests.find((r) => r.id === toRequestId);
    if (!toRequest) {
      throw new NotFoundException('Roommate request not found');
    }

    const existing = this.inMemoryConnects.find(
      (c) => c.fromRequestId === fromRequest!.id && c.toRequestId === toRequestId,
    );

    if (existing) {
      return existing; // idempotent in fallback mode
    }

    const newConnect: InMemoryRoommateConnect = {
      id: `conn_${Date.now()}`,
      fromRequestId: fromRequest.id,
      toRequestId,
      status: RoommateConnectStatus.PENDING,
      message: dto.message || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      fromRequest,
      toRequest,
    };

    this.inMemoryConnects.unshift(newConnect);
    return newConnect;
  }

  /** Get all incoming connection requests for the current user */
  async getIncomingConnects(studentId: string) {
    try {
      const myRequests = await this.prisma.roommateRequest.findMany({
        where: { studentId },
        select: { id: true },
      });

      const myRequestIds = myRequests.map((r) => r.id);

      return await this.prisma.roommateConnect.findMany({
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
    } catch (err: any) {
      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for getIncomingConnects.`);
      
      const myReqIds = this.inMemoryRequests
        .filter((r) => r.studentId === studentId)
        .map((r) => r.id);

      // Also allow connects directed to default demo requests
      myReqIds.push('req-student-demo-default', 'my_request');

      const matching = this.inMemoryConnects.filter((c) => myReqIds.includes(c.toRequestId));
      return matching.map((c) => {
        const fromReq = this.inMemoryRequests.find((r) => r.id === c.fromRequestId) || c.fromRequest;
        return {
          ...c,
          fromRequest: fromReq,
        };
      });
    }
  }

  /** Accept or decline a connection request */
  async respondToConnect(connectId: string, studentId: string, accept: boolean) {
    try {
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

      return await this.prisma.roommateConnect.update({
        where: { id: connectId },
        data: { status: accept ? RoommateConnectStatus.ACCEPTED : RoommateConnectStatus.DECLINED },
      });
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException) {
        throw err;
      }

      this.logger.warn(`Database unreachable (${err.message}). Using in-memory fallback for respondToConnect.`);
      const connect = this.inMemoryConnects.find((c) => c.id === connectId);
      if (!connect) {
        // Create mock accepted connect if not found
        return {
          id: connectId,
          status: accept ? RoommateConnectStatus.ACCEPTED : RoommateConnectStatus.DECLINED,
          updatedAt: new Date(),
        };
      }

      connect.status = accept ? RoommateConnectStatus.ACCEPTED : RoommateConnectStatus.DECLINED;
      connect.updatedAt = new Date();
      return connect;
    }
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
