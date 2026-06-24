import { Prisma, BookingStatus } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import type { CreateBookingDto, UpdateBookingDto, CancelBookingDto, QueryBookingDto } from '../validators/booking.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

function generateBookingRef(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${dateStr}-${random}`;
}

export class BookingService {
  async createBooking(data: CreateBookingDto, actorUserId?: string) {
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    if (checkOut <= checkIn) {
      throw new AppError('Check-out date must be after check-in date', HTTP_STATUS.BAD_REQUEST, 'INVALID_DATES');
    }

    let subtotalAmount = 0;
    
    // Check room availability and calculate subtotal
    for (const room of data.rooms) {
      if (room.roomId) {
        const conflicting = await bookingRepository.checkRoomAvailability(
          room.roomId,
          checkIn,
          checkOut
        );
        if (conflicting) {
          throw new AppError(`Room ${room.roomId} is not available for the selected dates`, HTTP_STATUS.CONFLICT, 'ROOM_NOT_AVAILABLE');
        }
      }
      subtotalAmount += room.nightlyRate * ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }

    const bookingRef = generateBookingRef();
    
    // For simplicity, totalAmount = subtotalAmount in this implementation
    const totalAmount = subtotalAmount;

    return bookingRepository.transaction(async (tx) => {
      const booking = await bookingRepository.create({
        hotelId: data.hotelId,
        bookingRef,
        customerProfileId: data.customerProfileId,
        bookedByUserId: actorUserId,
        sourceChannel: data.sourceChannel,
        status: BookingStatus.draft,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: data.adults,
        children: data.children,
        currencyCode: data.currencyCode,
        subtotalAmount,
        totalAmount,
        balanceDue: totalAmount,
        specialRequests: data.specialRequests,
        notes: data.notes,
      }, tx);

      for (const room of data.rooms) {
         await bookingRepository.createBookingRoom({
            hotelId: data.hotelId,
            bookingId: booking.id,
            roomTypeId: room.roomTypeId,
            roomId: room.roomId,
            status: BookingStatus.draft,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: room.adults,
            children: room.children,
            currencyCode: data.currencyCode,
            nightlyRate: room.nightlyRate,
            lineTotal: room.nightlyRate * ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
            notes: room.notes
         }, tx);
      }

      return bookingRepository.findById(booking.id, tx);
    });
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
    }
    return booking;
  }

  async updateBooking(id: string, data: UpdateBookingDto, actorUserId?: string) {
    const booking = await this.getBookingById(id);

    return bookingRepository.transaction(async (tx) => {
      const updateData: Prisma.BookingUncheckedUpdateInput = {
        ...data,
      };
      if (data.checkInDate) updateData.checkInDate = new Date(data.checkInDate);
      if (data.checkOutDate) updateData.checkOutDate = new Date(data.checkOutDate);

      const updated = await bookingRepository.update(id, updateData, tx);
      return bookingRepository.findById(updated.id, tx);
    });
  }

  async confirmBooking(id: string, actorUserId?: string) {
     const booking = await this.getBookingById(id);
     
     if (booking.status !== BookingStatus.draft) {
        throw new AppError('Only draft bookings can be confirmed', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
     }

     return bookingRepository.transaction(async (tx) => {
        const updated = await bookingRepository.update(id, {
           status: BookingStatus.confirmed,
           confirmedAt: new Date()
        }, tx);

        // Update all booking rooms to confirmed
        for (const room of booking.bookingRooms) {
           await tx.bookingRoom.update({
              where: { id: room.id },
              data: { status: BookingStatus.confirmed }
           });
        }
        
        return bookingRepository.findById(updated.id, tx);
     });
  }

  async cancelBooking(id: string, data: CancelBookingDto, actorUserId?: string) {
    const booking = await this.getBookingById(id);

    if (booking.status === BookingStatus.cancelled || booking.status === BookingStatus.checked_out) {
       throw new AppError('Booking cannot be cancelled in its current state', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return bookingRepository.transaction(async (tx) => {
      const updated = await bookingRepository.update(id, {
        status: BookingStatus.cancelled,
        cancelledAt: new Date(),
        cancelledByUserId: actorUserId,
        cancellationReason: data.cancellationReason
      }, tx);

      for (const room of booking.bookingRooms) {
         await tx.bookingRoom.update({
            where: { id: room.id },
            data: { status: BookingStatus.cancelled }
         });
      }

      return bookingRepository.findById(updated.id, tx);
    });
  }

  async deleteBooking(id: string, actorUserId?: string) {
    await this.getBookingById(id);

    return bookingRepository.transaction(async (tx) => {
      const deleted = await bookingRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listBookings(query: QueryBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }
    if (query.customerProfileId) {
      where.customerProfileId = query.customerProfileId;
    }
    if (query.status) {
      where.status = query.status;
    }

    if (query.fromDate || query.toDate) {
       where.checkInDate = {};
       if (query.fromDate) where.checkInDate.gte = new Date(query.fromDate);
       if (query.toDate) where.checkInDate.lte = new Date(query.toDate);
    }

    if (query.search) {
      where.OR = [
        { bookingRef: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      bookingRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      bookingRepository.count(where),
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

export const bookingService = new BookingService();
