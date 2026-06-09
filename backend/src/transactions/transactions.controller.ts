import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a transaction (checkout)' })
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: any) {
    return this.transactionsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions' })
  findAll() { return this.transactionsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction' })
  findOne(@Param('id') id: string) { return this.transactionsService.findOne(id); }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void a transaction (OWNER only)' })
  void(@Param('id') id: string) { return this.transactionsService.void(id); }
  // Refunds are handled by POST /refunds/:transactionId
}
