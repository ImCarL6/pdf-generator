import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-pdf')
  async generatePDF(@Res() res: Response): Promise<void> {
    await this.appService.generatePDF();

    const pdfFilePath = path.join(__dirname, 'resume.pdf');

    // Set appropriate headers for the PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=example.pdf');

    // Send the PDF content as the response
    res.sendFile(pdfFilePath);
  }
}