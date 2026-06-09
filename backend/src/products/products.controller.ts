import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post() @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: CreateProductDto) { return this.productsService.create(dto); }

  @Get() @ApiOperation({ summary: 'List active products' })
  findAll() { return this.productsService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get product' })
  findOne(@Param('id') id: string) { return this.productsService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.productsService.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Deactivate product' })
  remove(@Param('id') id: string) { return this.productsService.remove(id); }
}
