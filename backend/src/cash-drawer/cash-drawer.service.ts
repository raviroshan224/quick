import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenDrawerDto, CloseDrawerDto, CashMovementDto } from './dto/open-drawer.dto';

@Injectable()
export class CashDrawerService {
  constructor(private prisma: PrismaService) {}

  async openDrawer(dto: OpenDrawerDto, userId: string) {
    const existing = await this.prisma.cashDrawer.findFirst({
      where: { closedAt: null, salonId: dto.salonId ?? null },
    });
    if (existing) throw new BadRequestException('A cash drawer is already open');
    return this.prisma.cashDrawer.create({ data: { ...dto, openedById: userId } });
  }

  async getCurrent(salonId?: string) {
    const drawer = await this.prisma.cashDrawer.findFirst({
      where: { closedAt: null, salonId: salonId ?? null },
      include: { movements: { orderBy: { createdAt: 'desc' } } },
    });
    if (!drawer) throw new NotFoundException('No open cash drawer');
    return drawer;
  }

  async closeDrawer(id: string, dto: CloseDrawerDto, userId: string) {
    const drawer = await this.prisma.cashDrawer.findUnique({ where: { id }, include: { movements: true } });
    if (!drawer) throw new NotFoundException('Drawer not found');
    if (drawer.closedAt) throw new BadRequestException('Drawer is already closed');

    const totalMovements = drawer.movements.reduce((sum, m) => {
      return sum + (m.type === 'IN' ? m.amount : m.type === 'OUT' ? -m.amount : 0);
    }, 0);
    const expectedBalance = drawer.openBalance + totalMovements;
    const difference = dto.closeBalance - expectedBalance;

    return this.prisma.cashDrawer.update({
      where: { id },
      data: { closedAt: new Date(), closeBalance: dto.closeBalance, expectedBalance, difference, closedById: userId, notes: dto.notes },
    });
  }

  async addMovement(drawerId: string, dto: CashMovementDto, userId: string) {
    const drawer = await this.prisma.cashDrawer.findUnique({ where: { id: drawerId } });
    if (!drawer || drawer.closedAt) throw new BadRequestException('No open drawer found');
    return this.prisma.cashMovement.create({
      data: { cashDrawerId: drawerId, type: dto.type, amount: dto.amount, reason: dto.reason, createdById: userId },
    });
  }

  findAll() {
    return this.prisma.cashDrawer.findMany({ orderBy: { createdAt: 'desc' }, include: { movements: true } });
  }
}
