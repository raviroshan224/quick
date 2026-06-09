import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post(':transactionId')
  @Roles('OWNER', 'STAFF')
  create(
    @Param('transactionId') transactionId: string,
    @Body() dto: CreateRefundDto,
    @CurrentUser() user: any,
  ) {
    return this.refundsService.create(transactionId, dto, user.id);
  }

  @Get()
  @Roles('OWNER')
  findAll() {
    return this.refundsService.findAll();
  }

  @Get(':id')
  @Roles('OWNER')
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }
}
