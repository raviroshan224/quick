import { Module } from '@nestjs/common';
import { ImageLibraryController } from './image-library.controller';
import { ImageLibraryService } from './image-library.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImageLibraryController],
  providers: [ImageLibraryService],
  exports: [ImageLibraryService],
})
export class ImageLibraryModule {}
