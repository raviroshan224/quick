import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InventoryService } from './inventory.service';
import { InventoryMovementDto } from './dto/inventory-movement.dto';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movement')
  @Roles('OWNER', 'STAFF')
  recordMovement(@Body() dto: InventoryMovementDto, @CurrentUser() user: any) {
    return this.inventoryService.recordMovement(dto, user.id);
  }

  @Get('products')
  @Roles('OWNER', 'STAFF')
  findAllProducts() {
    return this.inventoryService.findAllProducts();
  }

  @Get('low-stock')
  @Roles('OWNER', 'STAFF')
  getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get('logs')
  @Roles('OWNER')
  @ApiQuery({ name: 'productId', required: false })
  findLogs(@Query('productId') productId?: string) {
    return this.inventoryService.findLogs(productId);
  }
}
