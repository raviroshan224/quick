import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayTransactions,
      customersServedToday,
      topStaff,
      lowStockProducts,
      activeCashDrawer,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'COMPLETED' },
        _sum: { total: true, tipAmount: true },
        _count: { id: true },
      }),
      this.prisma.transaction.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'COMPLETED', customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
      this.prisma.transactionItem.groupBy({
        by: ['staffId'],
        where: { transaction: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'COMPLETED' }, staffId: { not: null } },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
      this.prisma.$queryRaw<{ id: string; name: string; stock: number; lowStockThreshold: number }[]>`
        SELECT id, name, stock, "lowStockThreshold"
        FROM products
        WHERE "isActive" = true AND stock <= "lowStockThreshold"
        ORDER BY stock ASC
        LIMIT 10
      `,
      this.prisma.cashDrawer.findFirst({ where: { closedAt: null }, orderBy: { openedAt: 'desc' } }),
    ]);

    const staffIds = topStaff.map((s) => s.staffId).filter(Boolean) as string[];
    const staffDetails = staffIds.length
      ? await this.prisma.staff.findMany({
          where: { id: { in: staffIds } },
          include: { user: { select: { firstName: true, lastName: true } } },
        })
      : [];

    const topStaffEnriched = topStaff.map((s) => ({
      staff: staffDetails.find((sd) => sd.id === s.staffId),
      totalSales: s._sum.totalPrice ?? 0,
    }));

    return {
      todaySales: todayTransactions._sum.total ?? 0,
      todayTips: todayTransactions._sum.tipAmount ?? 0,
      todayTransactionCount: todayTransactions._count.id,
      customersServedToday: customersServedToday.length,
      topStaff: topStaffEnriched,
      lowStockAlerts: lowStockProducts,
      cashDrawerOpen: !!activeCashDrawer,
      cashDrawerBalance: activeCashDrawer?.openBalance ?? null,
    };
  }
}
