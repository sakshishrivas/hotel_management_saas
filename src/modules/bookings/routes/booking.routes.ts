import { Router } from 'express';
import {
  createBookingController,
  getBookingController,
  updateBookingController,
  confirmBookingController,
  cancelBookingController,
  deleteBookingController,
  listBookingsController,
} from '../controllers/booking.controller';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  queryBookingSchema,
} from '../validators/booking.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const bookingRouter = Router();

bookingRouter.use(authMiddleware);

bookingRouter.post(
  '/',
  authorize({ permissions: ['bookings:create'] }),
  validateMiddleware({ body: createBookingSchema }),
  asyncHandler(createBookingController),
);

bookingRouter.get(
  '/',
  authorize({ permissions: ['bookings:read'] }),
  validateMiddleware({ query: queryBookingSchema }),
  asyncHandler(listBookingsController),
);

bookingRouter.get(
  '/:id',
  authorize({ permissions: ['bookings:read'] }),
  asyncHandler(getBookingController),
);

bookingRouter.patch(
  '/:id',
  authorize({ permissions: ['bookings:update'] }),
  validateMiddleware({ body: updateBookingSchema }),
  asyncHandler(updateBookingController),
);

bookingRouter.post(
  '/:id/confirm',
  authorize({ permissions: ['bookings:update'] }),
  asyncHandler(confirmBookingController),
);

bookingRouter.post(
  '/:id/cancel',
  authorize({ permissions: ['bookings:cancel'] }),
  validateMiddleware({ body: cancelBookingSchema }),
  asyncHandler(cancelBookingController),
);

bookingRouter.delete(
  '/:id',
  authorize({ permissions: ['bookings:delete'] }),
  asyncHandler(deleteBookingController),
);
