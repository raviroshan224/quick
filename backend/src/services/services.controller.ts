import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post() @ApiOperation({ summary: 'Create service' })
  create(@Body() dto: CreateServiceDto) { return this.servicesService.create(dto); }

  @Get() @ApiOperation({ summary: 'List active services' })
  findAll() { return this.servicesService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get service' })
  findOne(@Param('id') id: string) { return this.servicesService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) { return this.servicesService.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Deactivate service' })
  remove(@Param('id') id: string) { return this.servicesService.remove(id); }
}
