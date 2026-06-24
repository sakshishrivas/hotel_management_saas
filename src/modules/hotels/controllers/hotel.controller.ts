import type { Request, Response, NextFunction } from 'express';
import { hotelService } from '../services/hotel.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createHotelController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const hotel = await hotelService.createHotel(req.body, actorId);
    sendSuccess(res, hotel, 'Hotel created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getHotelController(req: Request, res: Response, next: NextFunction) {
  try {
    const hotel = await hotelService.getHotelById(req.params.id);
    sendSuccess(res, hotel, 'Hotel retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateHotelController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const hotel = await hotelService.updateHotel(req.params.id, req.body, actorId);
    sendSuccess(res, hotel, 'Hotel updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteHotelController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await hotelService.deleteHotel(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Hotel deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listHotelsController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await hotelService.listHotels(req.query as any);
    sendSuccess(res, result, 'Hotels retrieved successfully');
  } catch (error) {
    next(error);
  }
}
