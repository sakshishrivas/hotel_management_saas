import type { Request, Response, NextFunction } from 'express';
import { housekeepingService } from '../services/housekeeping.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const task = await housekeepingService.createTask(req.body, actorId);
    sendSuccess(res, task, 'Housekeeping task created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await housekeepingService.getTaskById(req.params.id);
    sendSuccess(res, task, 'Housekeeping task retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const task = await housekeepingService.updateTask(req.params.id, req.body, actorId);
    sendSuccess(res, task, 'Housekeeping task updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function assignHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const task = await housekeepingService.assignTask(req.params.id, req.body, actorId);
    sendSuccess(res, task, 'Housekeeping task assigned successfully');
  } catch (error) {
    next(error);
  }
}

export async function startHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const task = await housekeepingService.startTask(req.params.id, actorId);
    sendSuccess(res, task, 'Housekeeping task started successfully');
  } catch (error) {
    next(error);
  }
}

export async function completeHousekeepingTaskController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const task = await housekeepingService.completeTask(req.params.id, req.body, actorId);
    sendSuccess(res, task, 'Housekeeping task completed successfully');
  } catch (error) {
    next(error);
  }
}

export async function listHousekeepingTasksController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await housekeepingService.listTasks(req.query as any);
    sendSuccess(res, result, 'Housekeeping tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
}
