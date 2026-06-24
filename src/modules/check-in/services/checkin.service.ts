import { Prisma, RoomStatus, BookingStatus } from '@prisma/client';
import { checkinRepository } from '../repositories/checkin.repository';
import type { CreateCheckinDto, QueryCheckinDto } from '../validators/checkin.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class CheckinService {
  async createCheckin(data: CreateCheckinDto, actorUserId?: string) {
    const existing = await checkinRepository.findByBookingId(data.bookingId);
    if (existing) {
      throw new AppError('Check-in record already exists for this booking', HTTP_STATUS.CONFLICT, 'CHECKIN_EXISTS');
    }

    const booking = await checkinRepository.getBookingWithRooms(data.bookingId);
    if (!booking) {
       throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.confirmed) {
       throw new AppError('Only confirmed bookings can be checked in', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return checkinRepository.transaction(async (tx) => {
      // 1. Create check-in record
      const checkin = await checkinRepository.create({
        hotelId: data.hotelId,
        bookingId: data.bookingId,
        checkedInByUserId: actorUserId,
        depositAmount: data.depositAmount,
        remarks: data.remarks,
      }, tx);

      // 2. Update booking status
      await checkinRepository.updateBookingStatus(booking.id, BookingStatus.checked_in, tx);

      // 3. Update room statuses and log history
      for (const bookingRoom of booking.bookingRooms) {
         if (bookingRoom.roomId) {
            const room = bookingRoom.room;
            if (room) {
               await checkinRepository.updateRoomStatus(room.id, RoomStatus.occupied, tx);
               await checkinRepository.logRoomStatusChange({
                  hotelId: data.hotelId,
                  roomId: room.id,
                  oldStatus: room.status,
                  newStatus: RoomStatus.occupied,
                  changedByUserId: actorUserId,
                  reason: `Check-in for booking ${booking.bookingRef}`
               }, tx);
            }
         }
      }

      return checkinRepository.findById(checkin.id, tx);
    });
  }

  async getCheckinById(id: string) {
    const checkin = await checkinRepository.findById(id);
    if (!checkin) {
      throw new AppError('Check-in record not found', HTTP_STATUS.NOT_FOUND, 'CHECKIN_NOT_FOUND');
    }
    return checkin;
  }

  async listCheckins(query: QueryCheckinDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CheckinRecordWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }
    if (query.bookingId) {
      where.bookingId = query.bookingId;
    }

    const [items, total] = await Promise.all([
      checkinRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      checkinRepository.count(where),
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

export const checkinService = new CheckinService();
