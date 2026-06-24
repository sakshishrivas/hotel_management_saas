import { Router } from 'express';
import {
  createPaymentController,
  getPaymentController,
  updatePaymentStatusController,
  listPaymentsController,
} from '../controllers/payment.controller';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  queryPaymentSchema,
} from '../validators/payment.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const paymentRouter = Router();

paymentRouter.use(authMiddleware);

paymentRouter.post(
  '/',
  authorize({ permissions: ['payments:create'] }),
  validateMiddleware({ body: createPaymentSchema }),
  asyncHandler(createPaymentController),
);

paymentRouter.get(
  '/',
  authorize({ permissions: ['payments:read'] }),
  validateMiddleware({ query: queryPaymentSchema }),
  asyncHandler(listPaymentsController),
);

paymentRouter.get(
  '/:id',
  authorize({ permissions: ['payments:read'] }),
  asyncHandler(getPaymentController),
);

paymentRouter.patch(
  '/:id/status',
  authorize({ permissions: ['payments:update'] }),
  validateMiddleware({ body: updatePaymentStatusSchema }),
  asyncHandler(updatePaymentStatusController),
);
