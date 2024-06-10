import 'dotenv/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { setupPuppeteer } from './puppeteerConfig.js';
import { login } from './auth.js';
import { downloadReports } from './downloadReports.js';

puppeteer.use(StealthPlugin());

const contabiliumScrapper = async () => {
  const downloadPath = './src/downloads';

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await setupPuppeteer(page, downloadPath);

  try {
    await login(page);

    const downloadReportsResponse = await downloadReports(page, downloadPath);

    console.log(downloadReportsResponse);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
};

export default contabiliumScrapper;
