import type { Request, Response, NextFunction } from 'express';
import { refundService } from '../services/refund.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function processRefundController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const refund = await refundService.processRefund(req.body, actorId);
    sendSuccess(res, refund, 'Refund processed successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getRefundController(req: Request, res: Response, next: NextFunction) {
  try {
    const refund = await refundService.getRefundById(req.params.id);
    sendSuccess(res, refund, 'Refund retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateRefundStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const refund = await refundService.updateRefundStatus(req.params.id, req.body, actorId);
    sendSuccess(res, refund, 'Refund status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function listRefundsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await refundService.listRefunds(req.query as any);
    sendSuccess(res, result, 'Refunds retrieved successfully');
  } catch (error) {
    next(error);
  }
}
