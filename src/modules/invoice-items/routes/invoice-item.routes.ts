import { Router } from 'express';
import {
  createInvoiceItemController,
  getInvoiceItemController,
  updateInvoiceItemController,
  deleteInvoiceItemController,
  listInvoiceItemsController,
} from '../controllers/invoice-item.controller';
import {
  createInvoiceItemSchema,
  updateInvoiceItemSchema,
  queryInvoiceItemSchema,
} from '../validators/invoice-item.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const invoiceItemRouter = Router();

invoiceItemRouter.use(authMiddleware);

invoiceItemRouter.post(
  '/',
  authorize({ permissions: ['invoice-items:create'] }),
  validateMiddleware({ body: createInvoiceItemSchema }),
  asyncHandler(createInvoiceItemController),
);

invoiceItemRouter.get(
  '/',
  authorize({ permissions: ['invoice-items:read'] }),
  validateMiddleware({ query: queryInvoiceItemSchema }),
  asyncHandler(listInvoiceItemsController),
);

invoiceItemRouter.get(
  '/:id',
  authorize({ permissions: ['invoice-items:read'] }),
  asyncHandler(getInvoiceItemController),
);

invoiceItemRouter.patch(
  '/:id',
  authorize({ permissions: ['invoice-items:update'] }),
  validateMiddleware({ body: updateInvoiceItemSchema }),
  asyncHandler(updateInvoiceItemController),
);

invoiceItemRouter.delete(
  '/:id',
  authorize({ permissions: ['invoice-items:delete'] }),
  asyncHandler(deleteInvoiceItemController),
);
