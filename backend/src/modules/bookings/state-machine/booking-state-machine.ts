import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';

export class BookingStateMachine {
  private static readonly allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [
      BookingStatus.ACCEPTED,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.ACCEPTED]: [
      BookingStatus.CONFIRMED,
      BookingStatus.PAID,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.PAID,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.PAID]: [
      BookingStatus.CHECKED_IN,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.CHECKED_IN]: [
      BookingStatus.COMPLETED,
    ],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.CANCELLED]: [],
  };

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    const allowed = this.allowedTransitions[from] || [];
    return allowed.includes(to);
  }

  static validateTransition(from: BookingStatus, to: BookingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid booking transition from '${from}' to '${to}'. Allowed next states from '${from}': [${this.allowedTransitions[from]?.join(', ') || 'none (terminal state)'}]`,
      );
    }
  }

  static getNextAllowedStates(current: BookingStatus): BookingStatus[] {
    return this.allowedTransitions[current] || [];
  }
}
