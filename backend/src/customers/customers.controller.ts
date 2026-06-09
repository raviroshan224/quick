import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post() @ApiOperation({ summary: 'Create customer' })
  create(@Body() dto: CreateCustomerDto) { return this.customersService.create(dto); }

  @Get() @ApiOperation({ summary: 'List customers' })
  findAll() { return this.customersService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get customer' })
  findOne(@Param('id') id: string) { return this.customersService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) { return this.customersService.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: string) { return this.customersService.remove(id); }
}
