import type { Request, Response, NextFunction } from 'express';
import { bookingGuestService } from '../services/booking-guest.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createBookingGuestController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const guest = await bookingGuestService.createBookingGuest(req.body, actorId);
    sendSuccess(res, guest, 'Booking guest created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getBookingGuestController(req: Request, res: Response, next: NextFunction) {
  try {
    const guest = await bookingGuestService.getBookingGuestById(req.params.id);
    sendSuccess(res, guest, 'Booking guest retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateBookingGuestController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const guest = await bookingGuestService.updateBookingGuest(req.params.id, req.body, actorId);
    sendSuccess(res, guest, 'Booking guest updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteBookingGuestController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await bookingGuestService.deleteBookingGuest(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Booking guest deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listBookingGuestsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingGuestService.listBookingGuests(req.query as any);
    sendSuccess(res, result, 'Booking guests retrieved successfully');
  } catch (error) {
    next(error);
  }
}
