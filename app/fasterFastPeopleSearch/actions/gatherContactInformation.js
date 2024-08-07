"use server"
import puppeteer from 'puppeteer';
import path from 'path';
import { Builder, By, until } from 'selenium-webdriver';

export async function gatherContactInformation(fastPeopleSearchUrl) {

  const screenshotsDirectoryPath = path.resolve(process.cwd(), '../farm-friend/app/fasterFastPeopleSearch/testScreenshots');
  try {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(fastPeopleSearchUrl);
    const htmlContent = await driver.getPageSource();
    console.log(htmlContent);
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(fastPeopleSearchUrl);    
    const screenshotPath = path.join(screenshotsDirectoryPath, 'screenshot.png');
    await page.screenshot({ path: screenshotPath });
    const htmlContent = await page.content();
    await browser.close();
    */


    await driver.quit();
    console.log('hello');
    return htmlContent;    
  } catch (error) {
    // error handling
  }
}