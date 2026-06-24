import { Prisma } from '@prisma/client';
import { roomRepository } from '../repositories/room.repository';
import type { CreateRoomDto, UpdateRoomDto, QueryRoomDto } from '../validators/room.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class RoomService {
  async createRoom(data: CreateRoomDto, actorUserId?: string) {
    const existing = await roomRepository.findByRoomNumber(data.hotelId, data.roomNumber);
    if (existing) {
      throw new AppError('Room with this number already exists in the hotel', HTTP_STATUS.CONFLICT, 'ROOM_EXISTS');
    }

    return roomRepository.transaction(async (tx) => {
      const room = await roomRepository.create(data, tx);

      if (data.status) {
        await roomRepository.logStatusChange(
          {
            hotelId: data.hotelId,
            roomId: room.id,
            newStatus: data.status,
            changedByUserId: actorUserId,
            reason: 'Room created',
          },
          tx,
        );
      }

      return room;
    });
  }

  async getRoomById(id: string) {
    const room = await roomRepository.findById(id);
    if (!room) {
      throw new AppError('Room not found', HTTP_STATUS.NOT_FOUND, 'ROOM_NOT_FOUND');
    }
    return room;
  }

  async updateRoom(id: string, data: UpdateRoomDto, actorUserId?: string) {
    const room = await this.getRoomById(id);

    if (data.roomNumber && data.roomNumber !== room.roomNumber) {
      const existing = await roomRepository.findByRoomNumber(room.hotelId, data.roomNumber);
      if (existing) {
        throw new AppError('Room with this number already exists in the hotel', HTTP_STATUS.CONFLICT, 'ROOM_EXISTS');
      }
    }

    return roomRepository.transaction(async (tx) => {
      const updated = await roomRepository.update(id, data as Prisma.RoomUncheckedUpdateInput, tx);

      if (data.status && data.status !== room.status) {
        await roomRepository.logStatusChange(
          {
            hotelId: room.hotelId,
            roomId: room.id,
            oldStatus: room.status,
            newStatus: data.status,
            changedByUserId: actorUserId,
            reason: 'Status updated manually',
          },
          tx,
        );
      }

      return updated;
    });
  }

  async deleteRoom(id: string, actorUserId?: string) {
    const room = await this.getRoomById(id);

    return roomRepository.transaction(async (tx) => {
      const deleted = await roomRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listRooms(query: QueryRoomDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }

    if (query.roomTypeId) {
      where.roomTypeId = query.roomTypeId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.roomNumber = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      roomRepository.findMany({ skip, take: limit, where, orderBy: { roomNumber: 'asc' } }),
      roomRepository.count(where),
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

export const roomService = new RoomService();
