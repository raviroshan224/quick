import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateDiscountDto) { return this.prisma.discount.create({ data: dto as any }); }

  findAll() { return this.prisma.discount.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }); }

  async findOne(id: string) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException(`Discount ${id} not found`);
    return discount;
  }

  async findByCode(code: string) {
    const discount = await this.prisma.discount.findUnique({ where: { code } });
    if (!discount) throw new NotFoundException(`Discount code "${code}" not found`);
    return discount;
  }

  async update(id: string, dto: UpdateDiscountDto) {
    await this.findOne(id);
    return this.prisma.discount.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.discount.update({ where: { id }, data: { isActive: false } });
  }
}
