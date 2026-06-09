import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImageLibraryService } from './image-library.service';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageAssetType } from '@prisma/client';

@ApiTags('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('images')
export class ImageLibraryController {
  constructor(private readonly imageLibraryService: ImageLibraryService) {}

  @Post()
  @Roles('OWNER')
  create(@Body() dto: CreateImageDto) {
    return this.imageLibraryService.create(dto);
  }

  @Get()
  @Roles('OWNER', 'STAFF')
  @ApiQuery({ name: 'type', enum: ImageAssetType, required: false })
  findAll(@Query('type') type?: ImageAssetType) {
    return this.imageLibraryService.findAll(type);
  }

  @Get(':id')
  @Roles('OWNER', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.imageLibraryService.findOne(id);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.imageLibraryService.remove(id);
  }
}
