import { Router } from 'express';
import {
  createCustomerController,
  getCustomerController,
  updateCustomerController,
  deleteCustomerController,
  listCustomersController,
} from '../controllers/customer.controller';
import {
  createCustomerSchema,
  updateCustomerSchema,
  queryCustomerSchema,
} from '../validators/customer.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const customerRouter = Router();

customerRouter.use(authMiddleware);

customerRouter.post(
  '/',
  authorize({ permissions: ['customers:create'] }),
  validateMiddleware({ body: createCustomerSchema }),
  asyncHandler(createCustomerController),
);

customerRouter.get(
  '/',
  authorize({ permissions: ['customers:read'] }),
  validateMiddleware({ query: queryCustomerSchema }),
  asyncHandler(listCustomersController),
);

customerRouter.get(
  '/:id',
  authorize({ permissions: ['customers:read'] }),
  asyncHandler(getCustomerController),
);

customerRouter.patch(
  '/:id',
  authorize({ permissions: ['customers:update'] }),
  validateMiddleware({ body: updateCustomerSchema }),
  asyncHandler(updateCustomerController),
);

customerRouter.delete(
  '/:id',
  authorize({ permissions: ['customers:delete'] }),
  asyncHandler(deleteCustomerController),
);
