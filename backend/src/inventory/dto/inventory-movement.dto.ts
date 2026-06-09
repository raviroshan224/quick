import { IsString, IsInt, IsEnum, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryMovementType } from '@prisma/client';

export class InventoryMovementDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty({ enum: InventoryMovementType }) @IsEnum(InventoryMovementType) type: InventoryMovementType;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
  @ApiProperty() @IsString() @IsNotEmpty() reason: string;
}
