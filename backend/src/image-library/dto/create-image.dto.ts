import { IsString, IsEnum, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImageAssetType } from '@prisma/client';

export class CreateImageDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() url: string;
  @ApiProperty({ enum: ImageAssetType }) @IsEnum(ImageAssetType) type: ImageAssetType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}
