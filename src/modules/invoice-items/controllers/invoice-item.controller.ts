import type { Request, Response, NextFunction } from 'express';
import { invoiceItemService } from '../services/invoice-item.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createInvoiceItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const item = await invoiceItemService.createInvoiceItem(req.body, actorId);
    sendSuccess(res, item, 'Invoice item created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await invoiceItemService.getInvoiceItemById(req.params.id);
    sendSuccess(res, item, 'Invoice item retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateInvoiceItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const item = await invoiceItemService.updateInvoiceItem(req.params.id, req.body, actorId);
    sendSuccess(res, item, 'Invoice item updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteInvoiceItemController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await invoiceItemService.deleteInvoiceItem(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Invoice item deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listInvoiceItemsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoiceItemService.listInvoiceItems(req.query as any);
    sendSuccess(res, result, 'Invoice items retrieved successfully');
  } catch (error) {
    next(error);
  }
}
