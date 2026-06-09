import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DateRangeDto } from './dto/date-range.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private dateFilter(dto: DateRangeDto) {
    return {
      ...(dto.from && { gte: new Date(dto.from) }),
      ...(dto.to && { lte: new Date(dto.to + 'T23:59:59.999Z') }),
    };
  }

  async getSalesSummary(dto: DateRangeDto) {
    const where = {
      status: TransactionStatus.COMPLETED,
      ...(dto.from || dto.to ? { createdAt: this.dateFilter(dto) } : {}),
    };

    const [count, aggregate, byMethod] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.aggregate({
        where,
        _sum: { total: true, subtotal: true, tipAmount: true, discountAmount: true },
        _avg: { total: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { total: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalTransactions: count,
      totalRevenue: aggregate._sum.total ?? 0,
      totalSubtotal: aggregate._sum.subtotal ?? 0,
      totalTips: aggregate._sum.tipAmount ?? 0,
      totalDiscounts: aggregate._sum.discountAmount ?? 0,
      averageTransaction: aggregate._avg.total ?? 0,
      byPaymentMethod: byMethod,
    };
  }

  async getStaffPerformance(dto: DateRangeDto) {
    const dateWhere = dto.from || dto.to ? { createdAt: this.dateFilter(dto) } : {};

    const staffGroups = await this.prisma.transactionItem.groupBy({
      by: ['staffId'],
      where: {
        staffId: { not: null },
        transaction: { status: TransactionStatus.COMPLETED, ...dateWhere },
      },
      _count: { id: true },
      _sum: { totalPrice: true, commissionAmount: true },
    });

    const staffIds = staffGroups.map((g) => g.staffId).filter(Boolean) as string[];
    const staffDetails = staffIds.length
      ? await this.prisma.staff.findMany({
          where: { id: { in: staffIds } },
          include: { user: { select: { firstName: true, lastName: true } } },
        })
      : [];

    return staffGroups.map((g) => ({
      staff: staffDetails.find((s) => s.id === g.staffId),
      serviceCount: g._count.id,
      totalSales: g._sum.totalPrice ?? 0,
      totalCommission: g._sum.commissionAmount ?? 0,
    }));
  }

  async getServicePopularity(dto: DateRangeDto) {
    const dateWhere = dto.from || dto.to ? { createdAt: this.dateFilter(dto) } : {};

    const groups = await this.prisma.transactionItem.groupBy({
      by: ['serviceId'],
      where: {
        serviceId: { not: null },
        transaction: { status: TransactionStatus.COMPLETED, ...dateWhere },
      },
      _count: { id: true },
      _sum: { totalPrice: true, quantity: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const serviceIds = groups.map((g) => g.serviceId).filter(Boolean) as string[];
    const services = serviceIds.length
      ? await this.prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true, category: { select: { name: true } }, price: true } })
      : [];

    return groups.map((g) => ({
      service: services.find((s) => s.id === g.serviceId),
      count: g._count.id,
      quantity: g._sum.quantity ?? 0,
      totalRevenue: g._sum.totalPrice ?? 0,
    }));
  }

  async getDailySummary(dto: DateRangeDto) {
    const where = {
      status: TransactionStatus.COMPLETED,
      ...(dto.from || dto.to ? { createdAt: this.dateFilter(dto) } : {}),
    };

    return this.prisma.transaction.findMany({
      where,
      select: { id: true, total: true, paymentMethod: true, tipAmount: true, isGuest: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getInventoryReport() {
    const [products, recentLogs] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true, cost: true, price: true },
      }),
      this.prisma.inventoryLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { product: { select: { name: true } } },
      }),
    ]);

    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);

    return { products, lowStock, recentLogs };
  }
}
