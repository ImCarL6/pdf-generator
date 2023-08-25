import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import jsPDF from 'jspdf';

@Injectable()
export class AppService {
  async generatePDF(): Promise<jsPDF> {

    const browser = await puppeteer.launch({defaultViewport: {width: 1920, height: 1080}, headless: 'new'});
    const page = await browser.newPage();

    await page.goto('https://carlos-silva-resume.vercel.app/');
    
    await page.waitForSelector('#bd-container');

    await page.waitForSelector('.home__img');

    await page.click('#snow-button')

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('.language-toggle-container'); // Replace with your selector
      elementsToRemove.forEach(element => element.remove());
    });

    await page.evaluate(() => {
      const divToRemove = document.getElementById('tsparticles');
      if (divToRemove) {
        divToRemove.remove();
      }
    });

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('#theme-button'); // Replace with your selector
      elementsToRemove.forEach(element => element.remove());
    });

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('#snow-button'); // Replace with your selector
      elementsToRemove.forEach(element => element.remove());
    });

    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('#resume__generate'); // Replace with your selector
      elementsToRemove.forEach(element => element.remove());
    });

    await page.click('#home > div.home__container.section.bd-grid > div.home__data.bd-grid > img')

    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
    });
    
    const element = await page.$('#area-cv')

    const pdf: Buffer | string = await element.screenshot({ omitBackground: true})

    const pdfFile: jsPDF = new jsPDF({format: [417, 255]});
    pdfFile.addImage(pdf, 'PNG', 0, 0, 0, 0);
    pdfFile.save('./dist/resume.pdf')
  
    await browser.close();

    return pdfFile;
  }
}
