import 'dotenv/config';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const waitForDownload = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  //set 720p resolution
  await page.setViewport({ width: 1280, height: 720 });

  const downloadPath = path.resolve('./src/downloads');
  fs.mkdirSync(downloadPath, { recursive: true });
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  try {
    await page.goto(`${process.env.CONTABILIUM_URL}/v2/login`);

    await page.waitForSelector('#email');
    await page.type('#email', process.env.CONTABILIUM_EMAIL);

    await page.waitForSelector('#password');
    await page.type('#password', process.env.CONTABILIUM_PASSWORD);

    await page.waitForSelector('button');
    await Promise.all([
      page.click('button'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
    ]);

    await page.goto(`${process.env.CONTABILIUM_URL}/comprobantes.aspx`, {
      waitUntil: 'networkidle0',
    });

    await page.waitForSelector('#ddlPeriodo');

    await page.select('#ddlPeriodo', '1');
    await page.evaluate(() => {
      const selectElement = document.getElementById('ddlPeriodo');
      selectElement.dispatchEvent(new Event('change'));
    });

    await page.waitForSelector('.dropdown-menu');
    await page.evaluate(() => {
      const detailedLink = document.querySelector(
        'ul.dropdown-menu li a[href="javascript:exportar(\'D\');"]'
      );
      if (detailedLink) {
        detailedLink.click();
      }
    });

    await page.waitForSelector('#lnkDownload', { visible: true });

    await page.evaluate(() => {
      document.querySelector('#lnkDownload').click();
    });

    await page.goto(
      `${process.env.CONTABILIUM_URL}/modulos/reportes/stock.aspx`
    );
    await page.waitForSelector('#btnBuscar', { visible: true });
    await page.click('#btnBuscar');

    await page.waitForSelector('#divIconoDescargar', { visible: true });
    await page.click('#divIconoDescargar');

    await page.waitForSelector('#lnkDownload', { visible: true });
    await page.evaluate(() => {
      document.querySelector('#lnkDownload').click();
    });

    await waitForDownload(5000);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
})();
