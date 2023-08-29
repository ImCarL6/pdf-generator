import { Module } from '@nestjs/common';
import { PdfController } from './api/controllers/pdf.controller';
import { PdfService } from './api/service/pdf.service';

@Module({
  imports: [],
  controllers: [PdfController],
  providers: [PdfService],
})
export class AppModule {}
