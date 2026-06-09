import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty() @IsString() userId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() specialties?: string[];
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) commission?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() salonId?: string;
}
