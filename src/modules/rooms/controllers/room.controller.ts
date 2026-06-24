import type { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/room.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createRoomController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const room = await roomService.createRoom(req.body, actorId);
    sendSuccess(res, room, 'Room created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getRoomController(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await roomService.getRoomById(req.params.id);
    sendSuccess(res, room, 'Room retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateRoomController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const room = await roomService.updateRoom(req.params.id, req.body, actorId);
    sendSuccess(res, room, 'Room updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteRoomController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await roomService.deleteRoom(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Room deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listRoomsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await roomService.listRooms(req.query as any);
    sendSuccess(res, result, 'Rooms retrieved successfully');
  } catch (error) {
    next(error);
  }
}
