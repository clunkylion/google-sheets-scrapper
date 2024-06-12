import 'dotenv/config';
import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
//import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { setupPuppeteer } from './puppeteerConfig.js';
import { login } from './auth.js';
import { downloadReports } from './downloadReports.js';

//puppeteer.use(StealthPlugin());

const contabiliumScrapper = async () => {
  const downloadPath = './src/downloads';

  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--single-process',
      '--no-zygote',
    ],
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  await setupPuppeteer(page, downloadPath);

  try {
    await login(page);

    return await downloadReports(page, downloadPath);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
};

export default contabiliumScrapper;
