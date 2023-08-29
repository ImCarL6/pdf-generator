import { HttpException, Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import {Browser, connect, Page, ElementHandle} from 'puppeteer-core';
import jsPDF from 'jspdf';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { createUrl } from '../../util/utils';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePDF(language?: string): Promise<string|void> {

    const resumeUrl: string = createUrl(process.env.RESUME_SITE, language)

    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
      region: process.env.AWS_REGION_RESUME
    });
    
    const browserlessKey: string = process.env.BROWSERLESS_KEY;
    
    const browser: Browser = await connect({
      browserWSEndpoint: browserlessKey,
    });
    
    this.logger.verbose('Puppeteer Connected.')
    
    const page: Page = await browser.newPage();

    await page.goto(resumeUrl);

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

    const element: ElementHandle<Element> = await page.$('#area-cv');

    const pdf: string | Buffer = await element.screenshot({ omitBackground: true });

    const pdfFile: jsPDF = language === 'br' ? new jsPDF({ format: [410, 240] }) : new jsPDF({ format: [405, 240] });
    pdfFile.addImage(pdf, 'PNG', 0, 0, 0, 0);

    const pdfS3: Buffer = Buffer.from(pdfFile.output('arraybuffer'));

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

    const command = new GetObjectCommand({Bucket: process.env.AWS_BUCKET, Key: fileName})
    const url: string | void = await getSignedUrl(s3, command, {expiresIn: 3600}).catch(err => {
      this.logger.error(err)
      throw new HttpException('Error', 500)

    })
    
    this.logger.verbose(`URL generated`)

    return url;
  }

  async defaultPDF(): Promise<string|void> {
    
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
      region: process.env.AWS_REGION_RESUME
    });

    const expires = 3600

    const command = new GetObjectCommand({Bucket: process.env.AWS_BUCKET, Key: 'Curriculum.pdf'})
    const url: string | void = await getSignedUrl(s3, command, {expiresIn: expires}).catch(err => {
      console.log(url)
      this.logger.error(err)
      throw new HttpException('Error', 500)
    })

    this.logger.verbose(`URL generated. expiring in ${expires}.`)

    return url;
  }
}
