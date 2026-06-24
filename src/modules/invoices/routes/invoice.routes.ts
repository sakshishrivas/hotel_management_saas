import { Router } from 'express';
import {
  generateInvoiceController,
  getInvoiceController,
  updateInvoiceController,
  deleteInvoiceController,
  listInvoicesController,
} from '../controllers/invoice.controller';
import {
  generateInvoiceSchema,
  updateInvoiceSchema,
  queryInvoiceSchema,
} from '../validators/invoice.validators';
import { asyncHandler } from '../../../utils/async-handler';
import { validateMiddleware } from '../../../middleware/validate.middleware';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authorize } from '../../../middleware/rbac.middleware';

export const invoiceRouter = Router();

invoiceRouter.use(authMiddleware);

invoiceRouter.post(
  '/generate',
  authorize({ permissions: ['invoices:create'] }),
  validateMiddleware({ body: generateInvoiceSchema }),
  asyncHandler(generateInvoiceController),
);

invoiceRouter.get(
  '/',
  authorize({ permissions: ['invoices:read'] }),
  validateMiddleware({ query: queryInvoiceSchema }),
  asyncHandler(listInvoicesController),
);

invoiceRouter.get(
  '/:id',
  authorize({ permissions: ['invoices:read'] }),
  asyncHandler(getInvoiceController),
);

invoiceRouter.patch(
  '/:id',
  authorize({ permissions: ['invoices:update'] }),
  validateMiddleware({ body: updateInvoiceSchema }),
  asyncHandler(updateInvoiceController),
);

invoiceRouter.delete(
  '/:id',
  authorize({ permissions: ['invoices:delete'] }),
  asyncHandler(deleteInvoiceController),
);
