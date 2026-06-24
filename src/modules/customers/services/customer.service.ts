import { Prisma } from '@prisma/client';
import { customerRepository } from '../repositories/customer.repository';
import type { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from '../validators/customer.validators';
import { AppError } from '../../../utils/app-error';
import { HTTP_STATUS } from '../../../constants/http-status';

function generateCustomerNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CUST-${timestamp}-${random}`;
}

export class CustomerService {
  async createCustomer(data: CreateCustomerDto, actorUserId?: string) {
    const existing = await customerRepository.findByUserAndHotel(data.userId, data.hotelId);
    if (existing) {
      throw new AppError(
        'Customer profile already exists for this user in this hotel',
        HTTP_STATUS.CONFLICT,
        'CUSTOMER_EXISTS',
      );
    }

    return customerRepository.transaction(async (tx) => {
      const customerNo = generateCustomerNo();
      const customer = await customerRepository.create(
        {
          ...data,
          customerNo,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        },
        tx,
      );
      return customer;
    });
  }

  async getCustomerById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND, 'CUSTOMER_NOT_FOUND');
    }
    return customer;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto, actorUserId?: string) {
    await this.getCustomerById(id);

    return customerRepository.transaction(async (tx) => {
      const updateData: Prisma.CustomerProfileUncheckedUpdateInput = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      };
      const updated = await customerRepository.update(id, updateData, tx);
      return updated;
    });
  }

  async deleteCustomer(id: string, actorUserId?: string) {
    await this.getCustomerById(id);

    return customerRepository.transaction(async (tx) => {
      const deleted = await customerRepository.softDelete(id, tx);
      return deleted;
    });
  }

  async listCustomers(query: QueryCustomerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerProfileWhereInput = {};

    if (query.hotelId) {
      where.hotelId = query.hotelId;
    }

    if (query.search) {
      where.OR = [
        { customerNo: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      customerRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      customerRepository.count(where),
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

export const customerService = new CustomerService();
