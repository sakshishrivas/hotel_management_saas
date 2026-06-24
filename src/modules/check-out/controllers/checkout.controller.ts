import type { Request, Response, NextFunction } from 'express';
import { checkoutService } from '../services/checkout.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createCheckoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const checkout = await checkoutService.createCheckout(req.body, actorId);
    sendSuccess(res, checkout, 'Check-out successful', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getCheckoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const checkout = await checkoutService.getCheckoutById(req.params.id);
    sendSuccess(res, checkout, 'Check-out record retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function listCheckoutsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkoutService.listCheckouts(req.query as any);
    sendSuccess(res, result, 'Check-out records retrieved successfully');
  } catch (error) {
    next(error);
  }
}
