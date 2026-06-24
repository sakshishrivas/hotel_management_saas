import type { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function generateInvoiceController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const invoice = await invoiceService.generateFromBooking(req.body, actorId);
    sendSuccess(res, invoice, 'Invoice generated successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceController(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    sendSuccess(res, invoice, 'Invoice retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateInvoiceController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, actorId);
    sendSuccess(res, invoice, 'Invoice updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteInvoiceController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await invoiceService.deleteInvoice(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listInvoicesController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await invoiceService.listInvoices(req.query as any);
    sendSuccess(res, result, 'Invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
}
