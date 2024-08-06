"use server"
import puppeteer from 'puppeteer';

export async function gatherContactInformation(fastPeopleSearchUrl) {
  
  try {    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(fastPeopleSearchUrl);    
    const htmlContent = await page.content();   
    await browser.close();   
    return htmlContent;
  } catch (error) {
    // error handling
  }
}