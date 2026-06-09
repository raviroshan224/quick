import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageAssetType } from '@prisma/client';

@Injectable()
export class ImageLibraryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateImageDto) {
    return this.prisma.imageAsset.create({ data: dto });
  }

  findAll(type?: ImageAssetType) {
    return this.prisma.imageAsset.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.imageAsset.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`Image ${id} not found`);
    return image;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.imageAsset.delete({ where: { id } });
  }
}
