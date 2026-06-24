import { Prisma } from '@prisma/client';
import { hotelRepository } from '../repositories/hotel.repository';
import type { CreateHotelDto, UpdateHotelDto, QueryHotelDto } from '../validators/hotel.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class HotelService {
  async createHotel(data: CreateHotelDto, actorUserId?: string) {
    const existing = await hotelRepository.findByCode(data.hotelCode);
    if (existing) {
      throw new AppError('Hotel with this code already exists', HTTP_STATUS.CONFLICT, 'HOTEL_EXISTS');
    }

    return hotelRepository.transaction(async (tx) => {
      const hotel = await hotelRepository.create(
        {
          ...data,
          isActive: data.isActive ?? true,
        },
        tx,
      );

      // We could add audit log here
      return hotel;
    });
  }

  async getHotelById(id: string) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) {
      throw new AppError('Hotel not found', HTTP_STATUS.NOT_FOUND, 'HOTEL_NOT_FOUND');
    }
    return hotel;
  }

  async updateHotel(id: string, data: UpdateHotelDto, actorUserId?: string) {
    const hotel = await this.getHotelById(id);

    if (data.hotelCode && data.hotelCode !== hotel.hotelCode) {
      const existing = await hotelRepository.findByCode(data.hotelCode);
      if (existing) {
        throw new AppError('Hotel with this code already exists', HTTP_STATUS.CONFLICT, 'HOTEL_EXISTS');
      }
    }

    return hotelRepository.transaction(async (tx) => {
      const updated = await hotelRepository.update(id, data as Prisma.HotelUncheckedUpdateInput, tx);
      return updated;
    });
  }

  async deleteHotel(id: string, actorUserId?: string) {
    const hotel = await this.getHotelById(id);

    return hotelRepository.transaction(async (tx) => {
      const deleted = await hotelRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listHotels(query: QueryHotelDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.HotelWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { hotelCode: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [items, total] = await Promise.all([
      hotelRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      hotelRepository.count(where),
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

export const hotelService = new HotelService();
