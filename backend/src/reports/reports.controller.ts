import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { DateRangeDto } from './dto/date-range.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales') @ApiOperation({ summary: 'Sales summary with breakdown by payment method' })
  getSales(@Query() dto: DateRangeDto) { return this.reportsService.getSalesSummary(dto); }

  @Get('staff-performance') @ApiOperation({ summary: 'Staff performance: sales, service count, commission' })
  getStaffPerformance(@Query() dto: DateRangeDto) { return this.reportsService.getStaffPerformance(dto); }

  @Get('services') @ApiOperation({ summary: 'Service popularity: booking count and revenue per service' })
  getServicePopularity(@Query() dto: DateRangeDto) { return this.reportsService.getServicePopularity(dto); }

  @Get('inventory') @ApiOperation({ summary: 'Inventory report: stock levels, low stock, recent movements' })
  getInventory() { return this.reportsService.getInventoryReport(); }

  @Get('daily') @ApiOperation({ summary: 'Daily transaction list' })
  getDaily(@Query() dto: DateRangeDto) { return this.reportsService.getDailySummary(dto); }
}
