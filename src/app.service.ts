import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import jsPDF from 'jspdf';

@Injectable()
export class AppService {
  async generatePDF(): Promise<jsPDF> {
    
    const browser = await puppeteer.connect({browserWSEndpoint: 'wss://chrome.browserless.io?token=b29363c3-a607-458f-82fd-db926358273d'})
    
    // const browser = await puppeteer.launch({defaultViewport: {width: 1920, height: 1080}, headless: 'new'});
    const page = await browser.newPage();
    
    
    await page.goto('https://carlos-silva-resume.vercel.app/');

    
    // await page.waitForSelector('#bd-container');
    
    // await page.waitForSelector('.home__img');
    
    // await page.waitForSelector('#bd-container');
    
    // await page.waitForSelector('#area-cv');
    
    await page.setViewport({width:970 , height: 955})
    
    
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
    
    // await page.evaluate(() => {
    //   const elementsToRemove = document.querySelectorAll('#theme-button'); // Replace with your selector
    //   elementsToRemove.forEach(element => element.remove());
    // });
    
    // await page.evaluate(() => {
    //   const elementsToRemove = document.querySelectorAll('#snow-button'); // Replace with your selector
    //   elementsToRemove.forEach(element => element.remove());
    // });
    
    await page.evaluate(() => {
      const elementsToRemove = document.querySelectorAll('#resume__generate'); // Replace with your selector
      elementsToRemove.forEach(element => element.remove());
    });

    
    // await page.click('#home > div.home__container.section.bd-grid > div.home__data.bd-grid > img')
    
    // await page.evaluate(() => {
    //   return new Promise<void>((resolve) => {
    //     setTimeout(() => {
    //       resolve();
    //     }, 15000);
    //   });
    // });
    
    const element = await page.$('#area-cv')
    
    const pdf = await element.screenshot({omitBackground: true})
    
    const pdfFile: jsPDF = new jsPDF({format: [405, 240]});
    pdfFile.addImage(pdf, 'PNG', 0, 0, 0, 0);
    pdfFile.save('./dist/resume.pdf')
    // console.log('confia')
    await browser.close();
    
    return pdfFile;
  }
}
