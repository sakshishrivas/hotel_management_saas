import { Prisma } from '@prisma/client';
import { roomTypeRepository } from '../repositories/room-type.repository';
import type { CreateRoomTypeDto, UpdateRoomTypeDto, QueryRoomTypeDto } from '../validators/room-type.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class RoomTypeService {
  async createRoomType(data: CreateRoomTypeDto, actorUserId?: string) {
    const existing = await roomTypeRepository.findByCode(data.hotelId, data.code);
    if (existing) {
      throw new AppError('RoomType with this code already exists in the hotel', HTTP_STATUS.CONFLICT, 'ROOM_TYPE_EXISTS');
    }

    return roomTypeRepository.transaction(async (tx) => {
      const roomType = await roomTypeRepository.create(
        {
          ...data,
          isActive: data.isActive ?? true,
        },
        tx,
      );
      return roomType;
    });
  }

  async getRoomTypeById(id: string) {
    const roomType = await roomTypeRepository.findById(id);
    if (!roomType) {
      throw new AppError('RoomType not found', HTTP_STATUS.NOT_FOUND, 'ROOM_TYPE_NOT_FOUND');
    }
    return roomType;
  }

  async updateRoomType(id: string, data: UpdateRoomTypeDto, actorUserId?: string) {
    const roomType = await this.getRoomTypeById(id);

    if (data.code && data.code !== roomType.code) {
      const existing = await roomTypeRepository.findByCode(roomType.hotelId, data.code);
      if (existing) {
        throw new AppError('RoomType with this code already exists in the hotel', HTTP_STATUS.CONFLICT, 'ROOM_TYPE_EXISTS');
      }
    }

    return roomTypeRepository.transaction(async (tx) => {
      const updated = await roomTypeRepository.update(id, data as Prisma.RoomTypeUncheckedUpdateInput, tx);
      return updated;
    });
  }

  async deleteRoomType(id: string, actorUserId?: string) {
    const roomType = await this.getRoomTypeById(id);

    return roomTypeRepository.transaction(async (tx) => {
      const deleted = await roomTypeRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listRoomTypes(query: QueryRoomTypeDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RoomTypeWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [items, total] = await Promise.all([
      roomTypeRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      roomTypeRepository.count(where),
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

export const roomTypeService = new RoomTypeService();
