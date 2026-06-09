import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@ApiTags('discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post() @ApiOperation({ summary: 'Create discount' })
  create(@Body() dto: CreateDiscountDto) { return this.discountsService.create(dto); }

  @Get() @ApiOperation({ summary: 'List active discounts' })
  findAll() { return this.discountsService.findAll(); }

  @Get('code/:code') @ApiOperation({ summary: 'Lookup discount by code' })
  findByCode(@Param('code') code: string) { return this.discountsService.findByCode(code); }

  @Get(':id') @ApiOperation({ summary: 'Get discount' })
  findOne(@Param('id') id: string) { return this.discountsService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update discount' })
  update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) { return this.discountsService.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Deactivate discount' })
  remove(@Param('id') id: string) { return this.discountsService.remove(id); }
}
