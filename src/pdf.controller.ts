import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { pdfDto } from './pdf.dto';

@Controller()
export class PdfController {
  private logger = new Logger(PdfController.name)

  constructor(private readonly pdfService: PdfService) {}

  @Get('generate-pdf')
  async generatePDF(@Req() request: Request, @Res() res: Response, @Query() queryParam: pdfDto): Promise<void> {
    this.logger.log(`GET ${request.url}`);

    const { language } = queryParam;
    const fileName: string | void = await this.pdfService.generatePDF(language);

    res.setHeader('Content-Type', 'text/html');

    res.status(200).send(fileName);
  }

  @Get('default-pdf')
  async defaultPDF(@Req() request: Request, @Res() res: Response): Promise<void> {
    this.logger.log(`GET ${request.url}`)
    const fileName = await this.pdfService.defaultPDF();

    res.setHeader('Content-Type', 'text/html');

    res.status(200).send(fileName);
  }
}
