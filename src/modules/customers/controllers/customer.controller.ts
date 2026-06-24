import type { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { sendSuccess } from '../../../utils/api-response';
import { HTTP_STATUS } from '../../../constants/http-status';

export async function createCustomerController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const customer = await customerService.createCustomer(req.body, actorId);
    sendSuccess(res, customer, 'Customer created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function getCustomerController(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    sendSuccess(res, customer, 'Customer retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    const customer = await customerService.updateCustomer(req.params.id, req.body, actorId);
    sendSuccess(res, customer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomerController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.sub;
    await customerService.deleteCustomer(req.params.id, actorId);
    sendSuccess(res, { deleted: true }, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listCustomersController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await customerService.listCustomers(req.query as any);
    sendSuccess(res, result, 'Customers retrieved successfully');
  } catch (error) {
    next(error);
  }
}
