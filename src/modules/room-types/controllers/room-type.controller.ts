import type { Request, Response, NextFunction } from 'express';
import { roomTypeService } from '../services/room-type.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createRoomTypeController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const roomType = await roomTypeService.createRoomType(req.body, actorId);
    sendSuccess(res, roomType, 'RoomType created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getRoomTypeController(req: Request, res: Response, next: NextFunction) {
  try {
    const roomType = await roomTypeService.getRoomTypeById(req.params.id);
    sendSuccess(res, roomType, 'RoomType retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateRoomTypeController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const roomType = await roomTypeService.updateRoomType(req.params.id, req.body, actorId);
    sendSuccess(res, roomType, 'RoomType updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteRoomTypeController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await roomTypeService.deleteRoomType(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'RoomType deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listRoomTypesController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await roomTypeService.listRoomTypes(req.query as any);
    sendSuccess(res, result, 'RoomTypes retrieved successfully');
  } catch (error) {
    next(error);
  }
}
