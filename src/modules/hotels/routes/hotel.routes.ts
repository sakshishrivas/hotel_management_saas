import { Router } from 'express';
import {
  createHotelController,
  getHotelController,
  updateHotelController,
  deleteHotelController,
  listHotelsController,
} from '../controllers/hotel.controller';
import {
  createHotelSchema,
  updateHotelSchema,
  queryHotelSchema,
} from '../validators/hotel.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const hotelRouter = Router();

hotelRouter.use(authMiddleware);

hotelRouter.post(
  '/',
  authorize({ permissions: ['hotels:create'] }),
  validateMiddleware({ body: createHotelSchema }),
  asyncHandler(createHotelController),
);

hotelRouter.get(
  '/',
  authorize({ permissions: ['hotels:read'] }),
  validateMiddleware({ query: queryHotelSchema }),
  asyncHandler(listHotelsController),
);

hotelRouter.get(
  '/:id',
  authorize({ permissions: ['hotels:read'] }),
  asyncHandler(getHotelController),
);

hotelRouter.patch(
  '/:id',
  authorize({ permissions: ['hotels:update'] }),
  validateMiddleware({ body: updateHotelSchema }),
  asyncHandler(updateHotelController),
);

hotelRouter.delete(
  '/:id',
  authorize({ permissions: ['hotels:delete'] }),
  asyncHandler(deleteHotelController),
);
