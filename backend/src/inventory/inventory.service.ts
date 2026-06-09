import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryMovementDto } from './dto/inventory-movement.dto';
import { InventoryMovementType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async recordMovement(dto: InventoryMovementDto, createdById: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    const delta =
      dto.type === InventoryMovementType.STOCK_IN ? dto.quantity
      : dto.type === InventoryMovementType.STOCK_OUT ? -dto.quantity
      : dto.quantity; // ADJUSTMENT can be positive or negative based on caller

    const newStock = product.stock + delta;
    if (newStock < 0) throw new BadRequestException('Stock cannot go below zero');

    const [updatedProduct, log] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: dto.productId },
        data: { stock: newStock },
      }),
      this.prisma.inventoryLog.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          stockBefore: product.stock,
          stockAfter: newStock,
          createdById,
        },
      }),
    ]);

    return { product: updatedProduct, log };
  }

  findAllProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  findLowStock() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: this.prisma.product.fields.lowStockThreshold as any },
      },
    });
  }

  // Workaround: raw query for low stock since Prisma can't compare two columns without raw
  async getLowStockProducts() {
    return this.prisma.$queryRaw<{ id: string; name: string; stock: number; lowStockThreshold: number }[]>`
      SELECT id, name, sku, stock, "lowStockThreshold"
      FROM products
      WHERE "isActive" = true AND stock <= "lowStockThreshold"
      ORDER BY stock ASC
    `;
  }

  findLogs(productId?: string) {
    return this.prisma.inventoryLog.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, sku: true } } },
    });
  }
}
