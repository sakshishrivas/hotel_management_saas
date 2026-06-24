import { Router } from 'express';
import {
  createRoomTypeController,
  getRoomTypeController,
  updateRoomTypeController,
  deleteRoomTypeController,
  listRoomTypesController,
} from '../controllers/room-type.controller';
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  queryRoomTypeSchema,
} from '../validators/room-type.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const roomTypeRouter = Router();

roomTypeRouter.use(authMiddleware);

roomTypeRouter.post(
  '/',
  authorize({ permissions: ['room-types:create'] }),
  validateMiddleware({ body: createRoomTypeSchema }),
  asyncHandler(createRoomTypeController),
);

roomTypeRouter.get(
  '/',
  authorize({ permissions: ['room-types:read'] }),
  validateMiddleware({ query: queryRoomTypeSchema }),
  asyncHandler(listRoomTypesController),
);

roomTypeRouter.get(
  '/:id',
  authorize({ permissions: ['room-types:read'] }),
  asyncHandler(getRoomTypeController),
);

roomTypeRouter.patch(
  '/:id',
  authorize({ permissions: ['room-types:update'] }),
  validateMiddleware({ body: updateRoomTypeSchema }),
  asyncHandler(updateRoomTypeController),
);

roomTypeRouter.delete(
  '/:id',
  authorize({ permissions: ['room-types:delete'] }),
  asyncHandler(deleteRoomTypeController),
);
