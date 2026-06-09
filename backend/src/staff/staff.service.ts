import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateStaffDto) {
    return this.prisma.staff.create({ data: dto, include: { user: { select: { firstName: true, lastName: true, email: true } } } });
  }

  findAll() {
    return this.prisma.staff.findMany({ where: { isActive: true }, include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({ where: { id }, include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } } });
    if (!staff) throw new NotFoundException(`Staff ${id} not found`);
    return staff;
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id);
    return this.prisma.staff.update({ where: { id }, data: dto, include: { user: { select: { firstName: true, lastName: true, email: true } } } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.staff.update({ where: { id }, data: { isActive: false } });
  }
}
