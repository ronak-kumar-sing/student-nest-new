export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
    public readonly totalAmount: number,
  ) {}
}

export class BookingAcceptedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
  ) {}
}

export class BookingRejectedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
    public readonly reason?: string,
  ) {}
}

export class BookingPaidEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
    public readonly paymentId: string,
    public readonly amount: number,
  ) {}
}

export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
    public readonly reason?: string,
    public readonly refundIssued?: boolean,
  ) {}
}

export class BookingCheckedInEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
  ) {}
}

export class BookingCompletedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly studentId: string,
    public readonly listingId: string,
  ) {}
}
