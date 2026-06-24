import type { Request, Response, NextFunction } from 'express';
import { checkinService } from '../services/checkin.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createCheckinController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const checkin = await checkinService.createCheckin(req.body, actorId);
    sendSuccess(res, checkin, 'Check-in successful', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getCheckinController(req: Request, res: Response, next: NextFunction) {
  try {
    const checkin = await checkinService.getCheckinById(req.params.id);
    sendSuccess(res, checkin, 'Check-in record retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function listCheckinsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkinService.listCheckins(req.query as any);
    sendSuccess(res, result, 'Check-in records retrieved successfully');
  } catch (error) {
    next(error);
  }
}
