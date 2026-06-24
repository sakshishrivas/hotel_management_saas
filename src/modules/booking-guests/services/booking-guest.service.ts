import { Prisma } from '@prisma/client';
import { bookingGuestRepository } from '../repositories/booking-guest.repository';
import type { CreateBookingGuestDto, UpdateBookingGuestDto, QueryBookingGuestDto } from '../validators/booking-guest.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class BookingGuestService {
  async createBookingGuest(data: CreateBookingGuestDto, actorUserId?: string) {
    return bookingGuestRepository.transaction(async (tx) => {
      const guest = await bookingGuestRepository.create({
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      }, tx);
      return guest;
    });
  }

  async getBookingGuestById(id: string) {
    const guest = await bookingGuestRepository.findById(id);
    if (!guest) {
      throw new AppError('Booking guest not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_GUEST_NOT_FOUND');
    }
    return guest;
  }

  async updateBookingGuest(id: string, data: UpdateBookingGuestDto, actorUserId?: string) {
    await this.getBookingGuestById(id);

    return bookingGuestRepository.transaction(async (tx) => {
      const updateData: Prisma.BookingGuestUncheckedUpdateInput = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      };
      const updated = await bookingGuestRepository.update(id, updateData, tx);
      return updated;
    });
  }

  async deleteBookingGuest(id: string, actorUserId?: string) {
    await this.getBookingGuestById(id);

    return bookingGuestRepository.transaction(async (tx) => {
      const deleted = await bookingGuestRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listBookingGuests(query: QueryBookingGuestDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingGuestWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }
    if (query.bookingRoomId) {
      where.bookingRoomId = query.bookingRoomId;
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      bookingGuestRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      bookingGuestRepository.count(where),
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

export const bookingGuestService = new BookingGuestService();
