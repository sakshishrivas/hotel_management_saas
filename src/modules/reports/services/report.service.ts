import { PrismaClient, PaymentStatus, InvoiceStatus } from '@prisma/client';
import type { DateRangeDto, OutstandingInvoicesDto, PaymentHistoryDto } from '../validators/report.validators';

// We use the raw Prisma client here for complex aggregations if needed
const prisma = new PrismaClient();

export class ReportService {
  async getRevenueSummary(query: DateRangeDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    
    // Set end date to end of day
    endDate.setHours(23, 59, 59, 999);

    const wherePayments = {
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
      status: PaymentStatus.captured,
      deletedAt: null,
      ...(query.hotelId && { hotelId: query.hotelId })
    };

    const whereInvoices = {
      invoiceDate: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
      status: { not: InvoiceStatus.void },
      ...(query.hotelId && { hotelId: query.hotelId })
    };

    // Calculate total payments received
    const paymentsAgg = await prisma.payment.aggregate({
      where: wherePayments,
      _sum: {
        amount: true
      }
    });

    // Calculate total invoiced amount
    const invoicesAgg = await prisma.invoice.aggregate({
      where: whereInvoices,
      _sum: {
        totalAmount: true,
        taxAmount: true,
      }
    });

    return {
      period: {
        startDate,
        endDate
      },
      revenue: {
        totalInvoiced: Number(invoicesAgg._sum.totalAmount || 0),
        totalTaxesInvoiced: Number(invoicesAgg._sum.taxAmount || 0),
        totalPaymentsCaptured: Number(paymentsAgg._sum.amount || 0)
      }
    };
  }

  async getOutstandingInvoices(query: OutstandingInvoicesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      balanceDue: { gt: 0 },
      status: { not: InvoiceStatus.void },
      deletedAt: null,
      ...(query.hotelId && { hotelId: query.hotelId })
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          booking: { select: { bookingRef: true } }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    // Also get the total outstanding amount
    const agg = await prisma.invoice.aggregate({
      where,
      _sum: { balanceDue: true }
    });

    return {
      items,
      summary: {
        totalOutstandingAmount: Number(agg._sum.balanceDue || 0)
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentHistory(query: PaymentHistoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(query.hotelId && { hotelId: query.hotelId })
    };

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          paymentAllocations: {
             include: { invoice: { select: { invoiceNumber: true } } }
          }
        }
      }),
      prisma.payment.count({ where })
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

export const reportService = new ReportService();
