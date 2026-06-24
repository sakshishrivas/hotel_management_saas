import { Router } from 'express';

import { healthRouter } from '../health.routes';
import { authRouter } from '../../modules/auth/routes';
import { hotelRouter } from '../../modules/hotels/routes';
import { roomTypeRouter } from '../../modules/room-types/routes';
import { roomRouter } from '../../modules/rooms/routes';
import { customerRouter } from '../../modules/customers/routes';
import { bookingRouter } from '../../modules/bookings/routes';
import { bookingGuestRouter } from '../../modules/booking-guests/routes';
import { checkinRouter } from '../../modules/check-in/routes';
import { checkoutRouter } from '../../modules/check-out/routes';
import { housekeepingRouter } from '../../modules/housekeeping/routes';
import { invoiceRouter } from '../../modules/invoices/routes';
import { invoiceItemRouter } from '../../modules/invoice-items/routes';
import { paymentRouter } from '../../modules/payments/routes';
import { paymentAllocationRouter } from '../../modules/payment-allocations/routes';
import { refundRouter } from '../../modules/refunds/routes';
import { reportRouter } from '../../modules/reports/routes';

export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/hotels', hotelRouter);
v1Router.use('/room-types', roomTypeRouter);
v1Router.use('/rooms', roomRouter);
v1Router.use('/customers', customerRouter);
v1Router.use('/bookings', bookingRouter);
v1Router.use('/booking-guests', bookingGuestRouter);
v1Router.use('/check-ins', checkinRouter);
v1Router.use('/check-outs', checkoutRouter);
v1Router.use('/housekeeping', housekeepingRouter);
v1Router.use('/invoices', invoiceRouter);
v1Router.use('/invoice-items', invoiceItemRouter);
v1Router.use('/payments', paymentRouter);
v1Router.use('/payment-allocations', paymentAllocationRouter);
v1Router.use('/refunds', refundRouter);
v1Router.use('/reports', reportRouter);
