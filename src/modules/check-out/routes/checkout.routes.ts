import { Router } from 'express';
import {
  createCheckoutController,
  getCheckoutController,
  listCheckoutsController,
} from '../controllers/checkout.controller';
import {
  createCheckoutSchema,
  queryCheckoutSchema,
} from '../validators/checkout.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const checkoutRouter = Router();

checkoutRouter.use(authMiddleware);

checkoutRouter.post(
  '/',
  authorize({ permissions: ['checkout:create'] }),
  validateMiddleware({ body: createCheckoutSchema }),
  asyncHandler(createCheckoutController),
);

checkoutRouter.get(
  '/',
  authorize({ permissions: ['checkout:read'] }),
  validateMiddleware({ query: queryCheckoutSchema }),
  asyncHandler(listCheckoutsController),
);

checkoutRouter.get(
  '/:id',
  authorize({ permissions: ['checkout:read'] }),
  asyncHandler(getCheckoutController),
);
