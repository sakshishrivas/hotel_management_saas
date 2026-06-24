import type { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const booking = await bookingService.createBooking(req.body, actorId);
    sendSuccess(res, booking, 'Booking created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    sendSuccess(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const booking = await bookingService.updateBooking(req.params.id, req.body, actorId);
    sendSuccess(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function confirmBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const booking = await bookingService.confirmBooking(req.params.id, actorId);
    sendSuccess(res, booking, 'Booking confirmed successfully');
  } catch (error) {
    next(error);
  }
}

export async function cancelBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const booking = await bookingService.cancelBooking(req.params.id, req.body, actorId);
    sendSuccess(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteBookingController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await bookingService.deleteBooking(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Booking deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listBookingsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingService.listBookings(req.query as any);
    sendSuccess(res, result, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
}
