import type { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../../../utils/api-response';

export async function getRevenueSummaryController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getRevenueSummary(req.query as any);
    sendSuccess(res, result, 'Revenue summary retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getOutstandingInvoicesController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getOutstandingInvoices(req.query as any);
    sendSuccess(res, result, 'Outstanding invoices retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getPaymentHistoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reportService.getPaymentHistory(req.query as any);
    sendSuccess(res, result, 'Payment history retrieved successfully');
  } catch (error) {
    next(error);
  }
}
