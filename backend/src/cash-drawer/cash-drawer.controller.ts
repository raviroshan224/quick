import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CashDrawerService } from './cash-drawer.service';
import { OpenDrawerDto, CloseDrawerDto, CashMovementDto } from './dto/open-drawer.dto';

@ApiTags('cash-drawer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-drawer')
export class CashDrawerController {
  constructor(private readonly cashDrawerService: CashDrawerService) {}

  @Post('open') @ApiOperation({ summary: 'Open cash drawer' })
  open(@Body() dto: OpenDrawerDto, @CurrentUser() user: any) { return this.cashDrawerService.openDrawer(dto, user.id); }

  @Get('current') @ApiOperation({ summary: 'Get current open drawer' })
  getCurrent(@Query('salonId') salonId?: string) { return this.cashDrawerService.getCurrent(salonId); }

  @Post(':id/close') @ApiOperation({ summary: 'Close cash drawer' })
  close(@Param('id') id: string, @Body() dto: CloseDrawerDto, @CurrentUser() user: any) { return this.cashDrawerService.closeDrawer(id, dto, user.id); }

  @Post(':id/movement') @ApiOperation({ summary: 'Record cash movement (pay-in/pay-out)' })
  movement(@Param('id') id: string, @Body() dto: CashMovementDto, @CurrentUser() user: any) { return this.cashDrawerService.addMovement(id, dto, user.id); }

  @Get() @ApiOperation({ summary: 'List all cash drawers' })
  findAll() { return this.cashDrawerService.findAll(); }
}
