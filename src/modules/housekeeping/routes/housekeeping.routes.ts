import { Router } from 'express';
import {
  createHousekeepingTaskController,
  getHousekeepingTaskController,
  updateHousekeepingTaskController,
  assignHousekeepingTaskController,
  startHousekeepingTaskController,
  completeHousekeepingTaskController,
  listHousekeepingTasksController,
} from '../controllers/housekeeping.controller';
import {
  createHousekeepingTaskSchema,
  updateHousekeepingTaskSchema,
  assignHousekeepingTaskSchema,
  completeHousekeepingTaskSchema,
  queryHousekeepingTaskSchema,
} from '../validators/housekeeping.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const housekeepingRouter = Router();

housekeepingRouter.use(authMiddleware);

housekeepingRouter.post(
  '/',
  authorize({ permissions: ['housekeeping:create'] }),
  validateMiddleware({ body: createHousekeepingTaskSchema }),
  asyncHandler(createHousekeepingTaskController),
);

housekeepingRouter.get(
  '/',
  authorize({ permissions: ['housekeeping:read'] }),
  validateMiddleware({ query: queryHousekeepingTaskSchema }),
  asyncHandler(listHousekeepingTasksController),
);

housekeepingRouter.get(
  '/:id',
  authorize({ permissions: ['housekeeping:read'] }),
  asyncHandler(getHousekeepingTaskController),
);

housekeepingRouter.patch(
  '/:id',
  authorize({ permissions: ['housekeeping:update'] }),
  validateMiddleware({ body: updateHousekeepingTaskSchema }),
  asyncHandler(updateHousekeepingTaskController),
);

housekeepingRouter.post(
  '/:id/assign',
  authorize({ permissions: ['housekeeping:assign'] }),
  validateMiddleware({ body: assignHousekeepingTaskSchema }),
  asyncHandler(assignHousekeepingTaskController),
);

housekeepingRouter.post(
  '/:id/start',
  authorize({ permissions: ['housekeeping:update'] }),
  asyncHandler(startHousekeepingTaskController),
);

housekeepingRouter.post(
  '/:id/complete',
  authorize({ permissions: ['housekeeping:complete'] }),
  validateMiddleware({ body: completeHousekeepingTaskSchema }),
  asyncHandler(completeHousekeepingTaskController),
);
