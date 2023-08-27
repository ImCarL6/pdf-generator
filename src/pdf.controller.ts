import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller()
export class PdfController {
  private logger = new Logger(PdfController.name)

  constructor(private readonly pdfService: PdfService) {}

  @Get('generate-pdf')
  async generatePDF(@Req() request: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`GET ${request.url}`)
    const fileName = await this.pdfService.generatePDF();

    res.setHeader('Content-Type', 'text/html');

    res.status(200).send(fileName);
  }
}
