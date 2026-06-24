import type { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const payment = await paymentService.recordPayment(req.body, actorId);
    sendSuccess(res, payment, 'Payment recorded successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    sendSuccess(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentStatusController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const payment = await paymentService.updatePaymentStatus(req.params.id, req.body, actorId);
    sendSuccess(res, payment, 'Payment status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function listPaymentsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.listPayments(req.query as any);
    sendSuccess(res, result, 'Payments retrieved successfully');
  } catch (error) {
    next(error);
  }
}
