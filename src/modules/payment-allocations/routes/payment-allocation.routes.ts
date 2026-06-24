import { Router } from 'express';
import {
  allocatePaymentController,
  getAllocationController,
  deleteAllocationController,
  listAllocationsController,
} from '../controllers/payment-allocation.controller';
import {
  allocatePaymentSchema,
  queryAllocationSchema,
} from '../validators/payment-allocation.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const paymentAllocationRouter = Router();

paymentAllocationRouter.use(authMiddleware);

paymentAllocationRouter.post(
  '/',
  authorize({ permissions: ['payment-allocations:create'] }),
  validateMiddleware({ body: allocatePaymentSchema }),
  asyncHandler(allocatePaymentController),
);

paymentAllocationRouter.get(
  '/',
  authorize({ permissions: ['payment-allocations:read'] }),
  validateMiddleware({ query: queryAllocationSchema }),
  asyncHandler(listAllocationsController),
);

paymentAllocationRouter.get(
  '/:id',
  authorize({ permissions: ['payment-allocations:read'] }),
  asyncHandler(getAllocationController),
);

paymentAllocationRouter.delete(
  '/:id',
  authorize({ permissions: ['payment-allocations:delete'] }),
  asyncHandler(deleteAllocationController),
);
