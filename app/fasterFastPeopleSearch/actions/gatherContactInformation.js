"use server"
import puppeteer from 'puppeteer';
import path from 'path';

export async function gatherContactInformation(fastPeopleSearchUrl) {

  const screenshotsDirectoryPath = path.resolve(process.cwd(), '../farm-friend/app/fasterFastPeopleSearch/testScreenshots');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(fastPeopleSearchUrl);    
    const screenshotPath = path.join(screenshotsDirectoryPath, 'screenshot.png');
    await page.screenshot({ path: screenshotPath });
    const htmlContent = await page.content();
    await browser.close();

    return htmlContent;
  } catch (error) {
    // error handling
  }
}