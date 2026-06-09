import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString,
  Min, ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class TransactionItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() serviceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() staffId?: string;
  @ApiProperty({ default: 1 }) @IsNumber() @Min(1) quantity: number;
  @ApiProperty() @IsNumber() @Min(0) unitPrice: number;
}

export class CreateTransactionDto {
  // Customer — either registered or guest
  @ApiPropertyOptional() @IsOptional() @IsString() customerId?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isGuest?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() guestName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() guestPhone?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() staffId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() discountId?: string;

  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;

  // Fonepay fields
  @ApiPropertyOptional() @IsOptional() @IsString() fonepayRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() qrData?: string;

  // Split payment fields (required when paymentMethod = SPLIT)
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) splitCash?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) splitFonepay?: number;

  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) tipAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;

  @ApiProperty({ type: [TransactionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];
}
