import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post() @ApiOperation({ summary: 'Create staff profile' })
  create(@Body() dto: CreateStaffDto) { return this.staffService.create(dto); }

  @Get() @ApiOperation({ summary: 'List all staff' })
  findAll() { return this.staffService.findAll(); }

  @Get(':id') @ApiOperation({ summary: 'Get staff by id' })
  findOne(@Param('id') id: string) { return this.staffService.findOne(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update staff' })
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) { return this.staffService.update(id, dto); }

  @Delete(':id') @ApiOperation({ summary: 'Deactivate staff' })
  remove(@Param('id') id: string) { return this.staffService.remove(id); }
}
