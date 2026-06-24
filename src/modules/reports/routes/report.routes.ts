import { Router } from 'express';
import {
  getRevenueSummaryController,
  getOutstandingInvoicesController,
  getPaymentHistoryController,
} from '../controllers/report.controller';
import {
  dateRangeSchema,
  outstandingInvoicesSchema,
  paymentHistorySchema,
} from '../validators/report.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const reportRouter = Router();

reportRouter.use(authMiddleware);

reportRouter.get(
  '/revenue',
  authorize({ permissions: ['reports:read'] }),
  validateMiddleware({ query: dateRangeSchema }),
  asyncHandler(getRevenueSummaryController),
);

reportRouter.get(
  '/outstanding-invoices',
  authorize({ permissions: ['reports:read'] }),
  validateMiddleware({ query: outstandingInvoicesSchema }),
  asyncHandler(getOutstandingInvoicesController),
);

reportRouter.get(
  '/payment-history',
  authorize({ permissions: ['reports:read'] }),
  validateMiddleware({ query: paymentHistorySchema }),
  asyncHandler(getPaymentHistoryController),
);
