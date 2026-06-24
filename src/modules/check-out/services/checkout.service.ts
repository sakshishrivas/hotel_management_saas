import { Prisma, RoomStatus, BookingStatus, HousekeepingStatus, HousekeepingPriority } from '@prisma/client';
import { checkoutRepository } from '../repositories/checkout.repository';
import type { CreateCheckoutDto, QueryCheckoutDto } from '../validators/checkout.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class CheckoutService {
  async createCheckout(data: CreateCheckoutDto, actorUserId?: string) {
    const existing = await checkoutRepository.findByBookingId(data.bookingId);
    if (existing) {
      throw new AppError('Check-out record already exists for this booking', HTTP_STATUS.CONFLICT, 'CHECKOUT_EXISTS');
    }

    const booking = await checkoutRepository.getBookingWithRooms(data.bookingId);
    if (!booking) {
       throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.checked_in) {
       throw new AppError('Only checked-in bookings can be checked out', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return checkoutRepository.transaction(async (tx) => {
      // 1. Create check-out record
      const checkout = await checkoutRepository.create({
        hotelId: data.hotelId,
        bookingId: data.bookingId,
        checkedOutByUserId: actorUserId,
        finalInspectionStatus: data.finalInspectionStatus,
        remarks: data.remarks,
      }, tx);

      // 2. Update booking status
      await checkoutRepository.updateBookingStatus(booking.id, BookingStatus.checked_out, tx);

      // 3. Update room statuses, log history, and create housekeeping tasks
      for (const bookingRoom of booking.bookingRooms) {
         if (bookingRoom.roomId) {
            const room = bookingRoom.room;
            if (room) {
               await checkoutRepository.updateRoomStatus(room.id, RoomStatus.dirty, tx);
               
               await checkoutRepository.logRoomStatusChange({
                  hotelId: data.hotelId,
                  roomId: room.id,
                  oldStatus: room.status,
                  newStatus: RoomStatus.dirty,
                  changedByUserId: actorUserId,
                  reason: `Check-out for booking ${booking.bookingRef}`
               }, tx);

               await checkoutRepository.createHousekeepingTask({
                  hotelId: data.hotelId,
                  roomId: room.id,
                  taskType: 'checkout_cleaning',
                  priority: HousekeepingPriority.high,
                  status: HousekeepingStatus.requested,
                  requestedByUserId: actorUserId,
                  notes: `Auto-generated on check-out of booking ${booking.bookingRef}`
               }, tx);
            }
         }
      }

      return checkoutRepository.findById(checkout.id, tx);
    });
  }

  async getCheckoutById(id: string) {
    const checkout = await checkoutRepository.findById(id);
    if (!checkout) {
      throw new AppError('Check-out record not found', HTTP_STATUS.NOT_FOUND, 'CHECKOUT_NOT_FOUND');
    }
    return checkout;
  }

  async listCheckouts(query: QueryCheckoutDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CheckoutRecordWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }
    if (query.bookingId) {
      where.bookingId = query.bookingId;
    }

    const [items, total] = await Promise.all([
      checkoutRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      checkoutRepository.count(where),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const checkoutService = new CheckoutService();
