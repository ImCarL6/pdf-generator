import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import jsPDF from 'jspdf';
import { S3 } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePDF(): Promise<string> {
    
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
      region: process.env.AWS_REGION_RESUME
    });
    
    const browserlessKey: string = process.env.BROWSERLESS_KEY;
    
    const browser = await puppeteer.connect({
      browserWSEndpoint: browserlessKey,
    });
    
    this.logger.verbose('Puppeteer Connected.')
    
    const page = await browser.newPage();

    await page.goto(process.env.RESUME_SITE);

    await page.waitForSelector('#bd-container');
    await page.waitForSelector('.home__img');
    await page.waitForSelector('#bd-container');
    await page.waitForSelector('#area-cv');

    await page.setViewport({ width: 970, height: 955 });

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll(
        '.language-toggle-container',
      );
      elementsToRemove.forEach((element) => element.remove());
    });

    await page.evaluate(() => {
      const divToRemove = document.getElementById('tsparticles');
      if (divToRemove) {
        divToRemove.remove();
      }
    });

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('#resume__generate');
      elementsToRemove.forEach((element) => element.remove());
    });

    const element = await page.$('#area-cv');

    const pdf = await element.screenshot({ omitBackground: true });

    const pdfFile: jsPDF = new jsPDF({ format: [405, 240] });
    pdfFile.addImage(pdf, 'PNG', 0, 0, 0, 0);

    const pdfS3 = Buffer.from(pdfFile.output('arraybuffer'));

    await browser.close();

    const fileName: string = uuidv4();

    this.logger.verbose('Inserting PDF into database.')

    await s3.putObject({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
      Body: pdfS3,
      ContentType: 'application/pdf',
    }).catch(err =>{
      this.logger.error(err)
    });

    this.logger.verbose('Success.')

    // await s3.deleteObject({
    //   Bucket: process.env.AWS_BUCKET,
    //   Key: fileName,
    // })

    return fileName;
  }
}
