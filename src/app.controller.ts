import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('generate-pdf')
  async generatePDF(@Res() res: Response): Promise<void> {
    const fileName = await this.appService.generatePDF();

    res.setHeader('Content-Type', 'text/html');

    res.status(200).send(fileName);
  }
}