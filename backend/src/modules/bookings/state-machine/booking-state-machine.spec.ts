import { describe, it, expect } from 'vitest';
import { BookingStateMachine } from './booking-state-machine.js';
import { BookingStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('BookingStateMachine', () => {
  it('should allow valid happy path transitions', () => {
    expect(
      BookingStateMachine.canTransition(BookingStatus.PENDING, BookingStatus.ACCEPTED),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.ACCEPTED, BookingStatus.PAID),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.PAID, BookingStatus.CHECKED_IN),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.CHECKED_IN, BookingStatus.COMPLETED),
    ).toBe(true);
  });

  it('should allow valid rejection and cancellation transitions', () => {
    expect(
      BookingStateMachine.canTransition(BookingStatus.PENDING, BookingStatus.REJECTED),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.PENDING, BookingStatus.CANCELLED),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.ACCEPTED, BookingStatus.CANCELLED),
    ).toBe(true);
    expect(
      BookingStateMachine.canTransition(BookingStatus.PAID, BookingStatus.CANCELLED),
    ).toBe(true);
  });

  it('should reject invalid transitions and throw BadRequestException', () => {
    // Cannot jump directly from PENDING to COMPLETED
    expect(
      BookingStateMachine.canTransition(BookingStatus.PENDING, BookingStatus.COMPLETED),
    ).toBe(false);
    expect(() =>
      BookingStateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.COMPLETED),
    ).toThrow(BadRequestException);

    // Terminal states cannot transition to anything
    expect(
      BookingStateMachine.canTransition(BookingStatus.REJECTED, BookingStatus.ACCEPTED),
    ).toBe(false);
    expect(() =>
      BookingStateMachine.validateTransition(BookingStatus.REJECTED, BookingStatus.ACCEPTED),
    ).toThrow(BadRequestException);

    expect(
      BookingStateMachine.canTransition(BookingStatus.COMPLETED, BookingStatus.CANCELLED),
    ).toBe(false);
    expect(() =>
      BookingStateMachine.validateTransition(BookingStatus.COMPLETED, BookingStatus.CANCELLED),
    ).toThrow(BadRequestException);

    expect(
      BookingStateMachine.canTransition(BookingStatus.CANCELLED, BookingStatus.PENDING),
    ).toBe(false);
    expect(() =>
      BookingStateMachine.validateTransition(BookingStatus.CANCELLED, BookingStatus.PENDING),
    ).toThrow(BadRequestException);
  });
});
