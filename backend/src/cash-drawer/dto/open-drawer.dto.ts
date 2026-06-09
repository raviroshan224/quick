import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenDrawerDto {
  @ApiProperty({ description: 'Starting cash balance' }) @IsNumber() @Min(0) openBalance: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salonId?: string;
}

export class CloseDrawerDto {
  @ApiProperty({ description: 'Actual cash counted at close' }) @IsNumber() @Min(0) closeBalance: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CashMovementDto {
  @ApiProperty({ enum: ['IN', 'OUT', 'ADJUSTMENT'] }) @IsString() type: 'IN' | 'OUT' | 'ADJUSTMENT';
  @ApiProperty() @IsNumber() @Min(0) amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
}
