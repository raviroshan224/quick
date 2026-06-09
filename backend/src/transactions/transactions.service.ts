import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionItemDto } from './dto/create-transaction.dto';
import { TransactionStatus, PaymentMethod } from '@prisma/client';

const TRANSACTION_INCLUDE = {
  customer: { select: { firstName: true, lastName: true, phone: true } },
  staff: { include: { user: { select: { firstName: true, lastName: true } } } },
  items: { include: { service: true, product: true, staff: { include: { user: { select: { firstName: true, lastName: true } } } } } },
  discount: true,
  refund: true,
};

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, userId: string) {
    const {
      items,
      tipAmount = 0,
      discountId,
      paymentMethod,
      splitCash,
      splitFonepay,
      isGuest = false,
      ...rest
    } = dto;

    // Validate split payment amounts
    if (paymentMethod === PaymentMethod.SPLIT) {
      if (splitCash == null || splitFonepay == null)
        throw new BadRequestException('splitCash and splitFonepay are required for SPLIT payment');
    }

    // Load staff commission rates for items that have a staffId
    const staffIds = [...new Set(items.map((i) => i.staffId).filter(Boolean))] as string[];
    const staffMap = staffIds.length
      ? await this.prisma.staff.findMany({ where: { id: { in: staffIds } }, select: { id: true, commissionRate: true } }).then(
          (rows) => Object.fromEntries(rows.map((r) => [r.id, r.commissionRate]))
        )
      : {};

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    let discountAmount = 0;

    if (discountId) {
      const discount = await this.prisma.discount.findUnique({ where: { id: discountId } });
      if (discount?.isActive) {
        discountAmount =
          discount.type === 'PERCENTAGE'
            ? (subtotal * discount.value) / 100
            : discount.value;
      }
    }

    const total = subtotal - discountAmount + tipAmount;

    // Validate split total matches
    if (paymentMethod === PaymentMethod.SPLIT && splitCash != null && splitFonepay != null) {
      const splitTotal = splitCash + splitFonepay;
      if (Math.abs(splitTotal - total) > 0.01)
        throw new BadRequestException(`Split amounts (${splitTotal}) must equal total (${total})`);
    }

    // Update customer stats if registered customer
    if (rest.customerId && !isGuest) {
      await this.prisma.customer.update({
        where: { id: rest.customerId },
        data: { visitCount: { increment: 1 }, totalSpent: { increment: total } },
      });
    }

    return this.prisma.transaction.create({
      data: {
        ...rest,
        userId,
        isGuest,
        subtotal,
        discountAmount,
        tipAmount,
        total,
        discountId,
        paymentMethod,
        splitCash: paymentMethod === PaymentMethod.SPLIT ? splitCash : null,
        splitFonepay: paymentMethod === PaymentMethod.SPLIT ? splitFonepay : null,
        items: {
          create: items.map((i: TransactionItemDto) => {
            const commissionRate = i.staffId ? (staffMap[i.staffId] ?? null) : null;
            const commissionAmount = commissionRate != null ? (i.unitPrice * i.quantity * commissionRate) / 100 : null;
            return {
              serviceId: i.serviceId,
              productId: i.productId,
              staffId: i.staffId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.unitPrice * i.quantity,
              commissionAmount,
            };
          }),
        },
      },
      include: TRANSACTION_INCLUDE,
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: TRANSACTION_INCLUDE,
    });
  }

  async findOne(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id }, include: TRANSACTION_INCLUDE });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  async void(id: string) {
    const tx = await this.findOne(id);
    if (tx.status !== TransactionStatus.COMPLETED)
      throw new BadRequestException('Only completed transactions can be voided');
    return this.prisma.transaction.update({ where: { id }, data: { status: TransactionStatus.VOIDED } });
  }
}
