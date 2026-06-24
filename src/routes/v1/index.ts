import { Router } from 'express';

import { healthRouter } from '../health.routes';
import { authRouter } from '../../modules/auth/routes';
import { hotelRouter } from '../../modules/hotels/routes';
import { roomTypeRouter } from '../../modules/room-types/routes';
import { roomRouter } from '../../modules/rooms/routes';

export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/hotels', hotelRouter);
v1Router.use('/room-types', roomTypeRouter);
v1Router.use('/rooms', roomRouter);
