import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get() @ApiOperation({ summary: 'Get salon settings' })
  getSettings(@Query('salonId') salonId?: string) { return this.settingsService.getSettings(salonId); }

  @Put() @Roles(Role.OWNER) @ApiOperation({ summary: 'Update salon settings' })
  updateSettings(@Body() dto: UpdateSettingsDto, @Query('salonId') salonId?: string) { return this.settingsService.updateSettings(dto, salonId); }
}
