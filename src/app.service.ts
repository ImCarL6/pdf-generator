import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import jsPDF from 'jspdf';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AppService {
  async generatePDF(): Promise<string> {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    });

    const browserlessKey: string = process.env.BROWSERLESS_KEY;

    const browser = await puppeteer.connect({
      browserWSEndpoint: browserlessKey,
    });

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
      const elementsToRemove = document.querySelectorAll('#resume__generate'); // Replace with your selector
      elementsToRemove.forEach((element) => element.remove());
    });

    const element = await page.$('#area-cv');

    const pdf = await element.screenshot({ omitBackground: true });

    const pdfFile: jsPDF = new jsPDF({ format: [405, 240] });
    pdfFile.addImage(pdf, 'PNG', 0, 0, 0, 0);

    const pdfS3 = Buffer.from(pdfFile.output('arraybuffer')) 

    await browser.close();

    const fileName: string = uuidv4()

    await s3
      .putObject({
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
        Body: pdfS3,
        ContentType: 'application/pdf'
      })
      .promise();

    // await s3.deleteObject({
    //   Bucket: process.env.AWS_BUCKET,
    //   Key: fileName,
    // })

    return fileName;
  }
}
