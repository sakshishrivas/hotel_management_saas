import { Router } from 'express';
import {
  processRefundController,
  getRefundController,
  updateRefundStatusController,
  listRefundsController,
} from '../controllers/refund.controller';
import {
  processRefundSchema,
  updateRefundStatusSchema,
  queryRefundSchema,
} from '../validators/refund.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const refundRouter = Router();

refundRouter.use(authMiddleware);

refundRouter.post(
  '/',
  authorize({ permissions: ['refunds:create'] }),
  validateMiddleware({ body: processRefundSchema }),
  asyncHandler(processRefundController),
);

refundRouter.get(
  '/',
  authorize({ permissions: ['refunds:read'] }),
  validateMiddleware({ query: queryRefundSchema }),
  asyncHandler(listRefundsController),
);

refundRouter.get(
  '/:id',
  authorize({ permissions: ['refunds:read'] }),
  asyncHandler(getRefundController),
);

refundRouter.patch(
  '/:id/status',
  authorize({ permissions: ['refunds:update'] }),
  validateMiddleware({ body: updateRefundStatusSchema }),
  asyncHandler(updateRefundStatusController),
);
