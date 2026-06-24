import { Prisma, HousekeepingStatus, RoomStatus } from '@prisma/client';
import { housekeepingRepository } from '../repositories/housekeeping.repository';
import type { 
   CreateHousekeepingTaskDto, 
   UpdateHousekeepingTaskDto, 
   AssignHousekeepingTaskDto, 
   CompleteHousekeepingTaskDto,
   QueryHousekeepingTaskDto 
} from '../validators/housekeeping.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class HousekeepingService {
  async createTask(data: CreateHousekeepingTaskDto, actorUserId?: string) {
    return housekeepingRepository.transaction(async (tx) => {
      const task = await housekeepingRepository.create({
        hotelId: data.hotelId,
        roomId: data.roomId,
        taskType: data.taskType,
        priority: data.priority,
        status: HousekeepingStatus.requested,
        requestedByUserId: actorUserId,
        scheduledStartAt: data.scheduledStartAt ? new Date(data.scheduledStartAt) : undefined,
        scheduledEndAt: data.scheduledEndAt ? new Date(data.scheduledEndAt) : undefined,
        notes: data.notes,
      }, tx);
      return task;
    });
  }

  async getTaskById(id: string) {
    const task = await housekeepingRepository.findById(id);
    if (!task) {
      throw new AppError('Housekeeping task not found', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND');
    }
    return task;
  }

  async updateTask(id: string, data: UpdateHousekeepingTaskDto, actorUserId?: string) {
    await this.getTaskById(id);

    return housekeepingRepository.transaction(async (tx) => {
      const updateData: Prisma.HousekeepingTaskUncheckedUpdateInput = {
        taskType: data.taskType,
        priority: data.priority,
        notes: data.notes,
      };
      if (data.scheduledStartAt) updateData.scheduledStartAt = new Date(data.scheduledStartAt);
      if (data.scheduledEndAt) updateData.scheduledEndAt = new Date(data.scheduledEndAt);

      const updated = await housekeepingRepository.update(id, updateData, tx);
      return updated;
    });
  }

  async assignTask(id: string, data: AssignHousekeepingTaskDto, actorUserId?: string) {
    const task = await this.getTaskById(id);

    if (task.status === HousekeepingStatus.completed || task.status === HousekeepingStatus.cancelled) {
       throw new AppError('Task cannot be assigned in its current state', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return housekeepingRepository.transaction(async (tx) => {
      const updated = await housekeepingRepository.update(id, {
        assignedToUserId: data.assignedToUserId,
        status: HousekeepingStatus.assigned,
      }, tx);
      return updated;
    });
  }

  async startTask(id: string, actorUserId?: string) {
    const task = await this.getTaskById(id);

    if (task.status !== HousekeepingStatus.assigned && task.status !== HousekeepingStatus.requested) {
       throw new AppError('Task cannot be started from its current state', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return housekeepingRepository.transaction(async (tx) => {
      const updated = await housekeepingRepository.update(id, {
        status: HousekeepingStatus.in_progress,
        startedAt: new Date(),
      }, tx);

      if (task.roomId) {
         await housekeepingRepository.updateRoomStatus(task.roomId, RoomStatus.cleaning, tx);
         await housekeepingRepository.logRoomStatusChange({
            hotelId: task.hotelId,
            roomId: task.roomId,
            oldStatus: task.room?.status,
            newStatus: RoomStatus.cleaning,
            changedByUserId: actorUserId,
            reason: `Housekeeping task started`
         }, tx);
      }

      return updated;
    });
  }

  async completeTask(id: string, data: CompleteHousekeepingTaskDto, actorUserId?: string) {
    const task = await this.getTaskById(id);

    if (task.status !== HousekeepingStatus.in_progress && task.status !== HousekeepingStatus.assigned) {
       throw new AppError('Task cannot be completed from its current state', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION');
    }

    return housekeepingRepository.transaction(async (tx) => {
      const updated = await housekeepingRepository.update(id, {
        status: HousekeepingStatus.completed,
        completedAt: new Date(),
        notes: data.notes ? `${task.notes || ''}\n[Completion Note]: ${data.notes}` : task.notes,
      }, tx);

      if (task.roomId) {
         await housekeepingRepository.updateRoomStatus(task.roomId, RoomStatus.available, tx);
         await housekeepingRepository.logRoomStatusChange({
            hotelId: task.hotelId,
            roomId: task.roomId,
            oldStatus: task.room?.status,
            newStatus: RoomStatus.available,
            changedByUserId: actorUserId,
            reason: `Housekeeping task completed`
         }, tx);
      }

      return updated;
    });
  }

  async listTasks(query: QueryHousekeepingTaskDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.HousekeepingTaskWhereInput = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.roomId) where.roomId = query.roomId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToUserId) where.assignedToUserId = query.assignedToUserId;
    if (query.search) {
       where.OR = [
          { taskType: { contains: query.search, mode: 'insensitive' } },
          { notes: { contains: query.search, mode: 'insensitive' } },
       ]
    }

    const [items, total] = await Promise.all([
      housekeepingRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      housekeepingRepository.count(where),
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

export const housekeepingService = new HousekeepingService();
