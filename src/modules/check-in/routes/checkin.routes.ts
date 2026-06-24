import { Router } from 'express';
import {
  createCheckinController,
  getCheckinController,
  listCheckinsController,
} from '../controllers/checkin.controller';
import {
  createCheckinSchema,
  queryCheckinSchema,
} from '../validators/checkin.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const checkinRouter = Router();

checkinRouter.use(authMiddleware);

checkinRouter.post(
  '/',
  authorize({ permissions: ['checkin:create'] }),
  validateMiddleware({ body: createCheckinSchema }),
  asyncHandler(createCheckinController),
);

checkinRouter.get(
  '/',
  authorize({ permissions: ['checkin:read'] }),
  validateMiddleware({ query: queryCheckinSchema }),
  asyncHandler(listCheckinsController),
);

checkinRouter.get(
  '/:id',
  authorize({ permissions: ['checkin:read'] }),
  asyncHandler(getCheckinController),
);
