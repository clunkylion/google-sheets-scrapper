import fs from 'fs';
import path from 'path';

const waitForDownload = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const monitorDownloads = async (downloadPath, page, filename) => {
  const filesBefore = new Set(fs.readdirSync(downloadPath));

  await page.evaluate(() => {
    document.querySelector('#lnkDownload').click();
  });

  let newFile = null;
  while (!newFile) {
    const filesAfter = new Set(fs.readdirSync(downloadPath));
    const difference = [...filesAfter].filter((x) => !filesBefore.has(x));
    if (difference.length > 0) {
      newFile = difference[0];
    } else {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const oldPath = path.join(downloadPath, newFile);
  const newPath = path.join(downloadPath, filename);
  fs.renameSync(oldPath, newPath);

  console.log(`El archivo se descargó y renombró a ${filename}`);
};

const downloadReport = async (page, type, filename) => {
  await page.evaluate((type) => {
    const link = document.querySelector(
      `ul.dropdown-menu li a[href="javascript:exportar('${type}');"]`
    );
    if (link) {
      link.click();
    }
  }, type);

  try {
    await page.waitForSelector('#divError', { timeout: 5000 });
    console.log(
      `No hay datos para el reporte ${type === 'S' ? 'simple' : 'detallado'}.`
    );
  } catch (error) {
    try {
      await page.waitForSelector('#lnkDownload', {
        visible: true,
        timeout: 5000,
      });
      await monitorDownloads(downloadPath, page, filename);
    } catch (downloadError) {
      console.log(
        `Error al intentar descargar el reporte ${
          type === 'S' ? 'simple' : 'detallado'
        }.`
      );
    }
  }
};

export const downloadReports = async (page, downloadPath) => {
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

  await downloadReport(page, 'S', 'simple_billed_report.xlsx');
  await downloadReport(page, 'D', 'detailed_billed_report.xlsx');

  await waitForDownload(10000);

  // Stock report
  await page.goto(`${process.env.CONTABILIUM_URL}/modulos/reportes/stock.aspx`);
  await page.waitForSelector('#btnBuscar', { visible: true });
  await page.click('#btnBuscar');

  await page.waitForSelector('#divIconoDescargar', { visible: true });
  await page.click('#divIconoDescargar');

  await page.waitForSelector('#lnkDownload', { visible: true });
  await monitorDownloads(downloadPath, page, 'stock_report.xlsx');

  await waitForDownload(10000);
};
