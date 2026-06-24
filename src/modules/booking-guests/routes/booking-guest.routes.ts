import { Router } from 'express';
import {
  createBookingGuestController,
  getBookingGuestController,
  updateBookingGuestController,
  deleteBookingGuestController,
  listBookingGuestsController,
} from '../controllers/booking-guest.controller';
import {
  createBookingGuestSchema,
  updateBookingGuestSchema,
  queryBookingGuestSchema,
} from '../validators/booking-guest.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const bookingGuestRouter = Router();

bookingGuestRouter.use(authMiddleware);

bookingGuestRouter.post(
  '/',
  authorize({ permissions: ['booking-guests:create'] }),
  validateMiddleware({ body: createBookingGuestSchema }),
  asyncHandler(createBookingGuestController),
);

bookingGuestRouter.get(
  '/',
  authorize({ permissions: ['booking-guests:read'] }),
  validateMiddleware({ query: queryBookingGuestSchema }),
  asyncHandler(listBookingGuestsController),
);

bookingGuestRouter.get(
  '/:id',
  authorize({ permissions: ['booking-guests:read'] }),
  asyncHandler(getBookingGuestController),
);

bookingGuestRouter.patch(
  '/:id',
  authorize({ permissions: ['booking-guests:update'] }),
  validateMiddleware({ body: updateBookingGuestSchema }),
  asyncHandler(updateBookingGuestController),
);

bookingGuestRouter.delete(
  '/:id',
  authorize({ permissions: ['booking-guests:delete'] }),
  asyncHandler(deleteBookingGuestController),
);
