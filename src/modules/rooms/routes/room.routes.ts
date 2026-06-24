import { Router } from 'express';
import {
  createRoomController,
  getRoomController,
  updateRoomController,
  deleteRoomController,
  listRoomsController,
} from '../controllers/room.controller';
import {
  createRoomSchema,
  updateRoomSchema,
  queryRoomSchema,
} from '../validators/room.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const roomRouter = Router();

roomRouter.use(authMiddleware);

roomRouter.post(
  '/',
  authorize({ permissions: ['rooms:create'] }),
  validateMiddleware({ body: createRoomSchema }),
  asyncHandler(createRoomController),
);

roomRouter.get(
  '/',
  authorize({ permissions: ['rooms:read'] }),
  validateMiddleware({ query: queryRoomSchema }),
  asyncHandler(listRoomsController),
);

roomRouter.get(
  '/:id',
  authorize({ permissions: ['rooms:read'] }),
  asyncHandler(getRoomController),
);

roomRouter.patch(
  '/:id',
  authorize({ permissions: ['rooms:update'] }),
  validateMiddleware({ body: updateRoomSchema }),
  asyncHandler(updateRoomController),
);

roomRouter.delete(
  '/:id',
  authorize({ permissions: ['rooms:delete'] }),
  asyncHandler(deleteRoomController),
);
