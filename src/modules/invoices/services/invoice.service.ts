import { Prisma, InvoiceStatus } from '@prisma/client';
import { invoiceRepository } from '../repositories/invoice.repository';
import type { GenerateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from '../validators/invoice.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

function generateInvoiceNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

export class InvoiceService {
  async generateFromBooking(data: GenerateInvoiceDto, actorUserId?: string) {
    const existing = await invoiceRepository.findByBookingId(data.bookingId);
    if (existing) {
      throw new AppError('Invoice already exists for this booking', HTTP_STATUS.CONFLICT, 'INVOICE_EXISTS');
    }

    const booking = await invoiceRepository.getBookingWithDetails(data.bookingId);
    if (!booking) {
       throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
    }

    return invoiceRepository.transaction(async (tx) => {
      // Create the invoice
      const invoice = await invoiceRepository.create({
         hotelId: data.hotelId,
         bookingId: booking.id,
         invoiceNumber: generateInvoiceNo(),
         dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
         status: InvoiceStatus.draft,
         currencyCode: booking.currencyCode,
         subtotalAmount: booking.subtotalAmount,
         taxAmount: booking.taxAmount,
         discountAmount: booking.discountAmount,
         totalAmount: booking.totalAmount,
         balanceDue: booking.totalAmount, // initially balance equals total
         issuedByUserId: actorUserId,
         notes: data.notes
      }, tx);

      // Create invoice items for each booking room
      let lineNo = 1;
      for (const room of booking.bookingRooms) {
         await tx.invoiceItem.create({
            data: {
               hotelId: data.hotelId,
               invoiceId: invoice.id,
               lineNo: lineNo++,
               itemType: 'room_charge',
               sourceTable: 'booking_rooms',
               sourceId: room.id,
               description: `Room charge for ${room.checkInDate.toISOString().slice(0, 10)} to ${room.checkOutDate.toISOString().slice(0, 10)}`,
               quantity: 1,
               unitPrice: room.lineTotal,
               taxAmount: room.taxAmount,
               discountAmount: room.discountAmount,
               lineTotal: room.lineTotal
            }
         });
      }

      return invoiceRepository.findById(invoice.id, tx);
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new AppError('Invoice not found', HTTP_STATUS.NOT_FOUND, 'INVOICE_NOT_FOUND');
    }
    return invoice;
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto, actorUserId?: string) {
    await this.getInvoiceById(id);

    return invoiceRepository.transaction(async (tx) => {
      const updateData: Prisma.InvoiceUncheckedUpdateInput = {
         status: data.status,
         notes: data.notes
      };
      if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

      const updated = await invoiceRepository.update(id, updateData, tx);
      return invoiceRepository.findById(updated.id, tx);
    });
  }

  async deleteInvoice(id: string, actorUserId?: string) {
     const invoice = await this.getInvoiceById(id);
     
     if (invoice.status !== InvoiceStatus.draft) {
        throw new AppError('Only draft invoices can be deleted', HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS');
     }

     return invoiceRepository.transaction(async (tx) => {
        return invoiceRepository.softDelete(id, tx);
     });
  }

  async listInvoices(query: QueryInvoiceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};

    if (query.hotelId) where.hotelId = query.hotelId;
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      invoiceRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      invoiceRepository.count(where),
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

export const invoiceService = new InvoiceService();
