import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async create(transactionId: string, dto: CreateRefundDto, refundedById: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { cashMovement: { select: { cashDrawerId: true } } },
    });

    if (!tx) throw new NotFoundException(`Transaction ${transactionId} not found`);
    if (tx.status !== TransactionStatus.COMPLETED)
      throw new BadRequestException('Only completed transactions can be refunded');

    const existing = await this.prisma.refund.findUnique({ where: { transactionId } });
    if (existing) throw new BadRequestException('Transaction has already been refunded');

    const refundAmount = dto.amount ?? tx.total;
    if (refundAmount > tx.total)
      throw new BadRequestException('Refund amount cannot exceed transaction total');

    // Refunds always go back as cash — find the active cash drawer
    const activeCashDrawer = await this.prisma.cashDrawer.findFirst({
      where: { closedAt: null },
      orderBy: { openedAt: 'desc' },
    });
    if (!activeCashDrawer) throw new BadRequestException('No active cash drawer — open a drawer before processing refunds');

    const [refund] = await this.prisma.$transaction([
      this.prisma.refund.create({
        data: {
          transactionId,
          amount: refundAmount,
          reason: dto.reason,
          refundedById,
          cashMovement: {
            create: {
              cashDrawerId: activeCashDrawer.id,
              type: 'OUT',
              amount: refundAmount,
              reason: `Refund: ${dto.reason}`,
              createdById: refundedById,
            },
          },
        },
        include: { transaction: true, cashMovement: true },
      }),
      this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TransactionStatus.REFUNDED },
      }),
    ]);

    return refund;
  }

  findAll() {
    return this.prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          select: { total: true, paymentMethod: true, createdAt: true, staff: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
        cashMovement: { select: { cashDrawerId: true, amount: true } },
      },
    });
  }

  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: { transaction: true, cashMovement: true },
    });
    if (!refund) throw new NotFoundException(`Refund ${id} not found`);
    return refund;
  }
}
