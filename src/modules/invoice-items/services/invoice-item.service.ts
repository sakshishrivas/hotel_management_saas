import { Prisma, InvoiceStatus } from '@prisma/client';
import { invoiceItemRepository } from '../repositories/invoice-item.repository';
import type { CreateInvoiceItemDto, UpdateInvoiceItemDto, QueryInvoiceItemDto } from '../validators/invoice-item.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class InvoiceItemService {
  async createInvoiceItem(data: CreateInvoiceItemDto, actorUserId?: string) {
    const invoiceStatus = await invoiceItemRepository.getInvoiceStatus(data.invoiceId);
    if (!invoiceStatus) throw new AppError('Invoice not found', HTTP_STATUS.NOT_FOUND, 'INVOICE_NOT_FOUND');
    if (invoiceStatus !== InvoiceStatus.draft) {
      throw new AppError('Can only add items to draft invoices', HTTP_STATUS.BAD_REQUEST, 'INVALID_INVOICE_STATUS');
    }

    return invoiceItemRepository.transaction(async (tx) => {
      const lineNo = await invoiceItemRepository.getNextLineNo(data.invoiceId, tx);
      const lineTotal = (data.unitPrice * data.quantity) + data.taxAmount - data.discountAmount;

      const item = await invoiceItemRepository.create({
        ...data,
        lineNo,
        lineTotal
      }, tx);

      // Update parent invoice totals
      const totals = await invoiceItemRepository.getInvoiceTotals(data.invoiceId, tx);
      await invoiceItemRepository.updateInvoiceTotals(data.invoiceId, totals, tx);

      return item;
    });
  }

  async getInvoiceItemById(id: string) {
    const item = await invoiceItemRepository.findById(id);
    if (!item) {
      throw new AppError('Invoice item not found', HTTP_STATUS.NOT_FOUND, 'INVOICE_ITEM_NOT_FOUND');
    }
    return item;
  }

  async updateInvoiceItem(id: string, data: UpdateInvoiceItemDto, actorUserId?: string) {
    const item = await this.getInvoiceItemById(id);
    if (item.invoice.status !== InvoiceStatus.draft) {
      throw new AppError('Can only modify items on draft invoices', HTTP_STATUS.BAD_REQUEST, 'INVALID_INVOICE_STATUS');
    }

    return invoiceItemRepository.transaction(async (tx) => {
      const newQuantity = data.quantity ?? Number(item.quantity);
      const newUnitPrice = data.unitPrice ?? Number(item.unitPrice);
      const newTax = data.taxAmount ?? Number(item.taxAmount);
      const newDiscount = data.discountAmount ?? Number(item.discountAmount);
      const newLineTotal = (newUnitPrice * newQuantity) + newTax - newDiscount;

      const updateData: Prisma.InvoiceItemUncheckedUpdateInput = {
        ...data,
        lineTotal: newLineTotal
      };

      const updated = await invoiceItemRepository.update(id, updateData, tx);

      // Update parent invoice totals
      const totals = await invoiceItemRepository.getInvoiceTotals(item.invoiceId, tx);
      await invoiceItemRepository.updateInvoiceTotals(item.invoiceId, totals, tx);

      return updated;
    });
  }

  async deleteInvoiceItem(id: string, actorUserId?: string) {
     const item = await this.getInvoiceItemById(id);
     
     if (item.invoice.status !== InvoiceStatus.draft) {
        throw new AppError('Can only delete items from draft invoices', HTTP_STATUS.BAD_REQUEST, 'INVALID_INVOICE_STATUS');
     }

     return invoiceItemRepository.transaction(async (tx) => {
        const deleted = await invoiceItemRepository.softDelete(id, tx);
        
        // Update parent invoice totals
        const totals = await invoiceItemRepository.getInvoiceTotals(item.invoiceId, tx);
        await invoiceItemRepository.updateInvoiceTotals(item.invoiceId, totals, tx);

        return deleted;
     });
  }

  async listInvoiceItems(query: QueryInvoiceItemDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceItemWhereInput = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.invoiceId) where.invoiceId = query.invoiceId;

    const [items, total] = await Promise.all([
      invoiceItemRepository.findMany({ skip, take: limit, where, orderBy: { lineNo: 'asc' } }),
      invoiceItemRepository.count(where),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const invoiceItemService = new InvoiceItemService();
