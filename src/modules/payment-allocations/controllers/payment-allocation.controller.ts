import type { Request, Response, NextFunction } from 'express';
import { paymentAllocationService } from '../services/payment-allocation.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function allocatePaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const allocation = await paymentAllocationService.allocate(req.body, actorId);
    sendSuccess(res, allocation, 'Payment allocated successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getAllocationController(req: Request, res: Response, next: NextFunction) {
  try {
    const allocation = await paymentAllocationService.getAllocationById(req.params.id);
    sendSuccess(res, allocation, 'Allocation retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAllocationController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await paymentAllocationService.deleteAllocation(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Allocation reversed successfully');
  } catch (error) {
    next(error);
  }
}

export async function listAllocationsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentAllocationService.listAllocations(req.query as any);
    sendSuccess(res, result, 'Allocations retrieved successfully');
  } catch (error) {
    next(error);
  }
}
