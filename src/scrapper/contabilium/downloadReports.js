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

const downloadReport = async (page, type, filename, downloadPath) => {
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
    const isDivErrorVisible = await page.evaluate(() => {
      const divError = document.querySelector('#divError');
      return divError && window.getComputedStyle(divError).display === 'block';
    });

    if (isDivErrorVisible) {
      console.log(
        `No hay datos para el reporte de facturación ${
          type === 'S' ? 'simple' : 'detallado'
        }.`
      );
      return {
        success: false,
        message: `No hay datos para el reporte de facturación ${
          type === 'S' ? 'simple' : 'detallado'
        }`,
      };
    } else {
      await page.waitForSelector('#lnkDownload', {
        visible: true,
        timeout: 5000,
      });
      await monitorDownloads(downloadPath, page, filename);
      return {
        success: true,
        message: `Reporte de facturación ${
          type === 'S' ? 'simple' : 'detallado'
        } descargado correctamente`,
      };
    }
  } catch (downloadError) {
    console.log(
      `Error al intentar descargar el reporte de facturación${
        type === 'S' ? 'simple' : 'detallado'
      }.`
    );
    return {
      success: false,
      message: `Error al intentar descargar el reporte de facturación${
        type === 'S' ? 'simple' : 'detallado'
      }`,
    };
  }
};

const downloadStockReport = async (page, filename, downloadPath) => {
  try {
    await page.waitForSelector('#btnBuscar', { visible: true });
    await page.click('#btnBuscar');

    await page.waitForSelector('#divIconoDescargar', { visible: true });
    await page.click('#divIconoDescargar');

    await page.waitForSelector('#lnkDownload', { visible: true });
    await monitorDownloads(downloadPath, page, filename);

    return {
      success: true,
      message: 'Reporte de stock descargado correctamente',
    };
  } catch (error) {
    console.error(error);
    console.log('Error al intentar descargar el reporte de stock.');
    return {
      success: false,
      message: 'Error al intentar descargar el reporte de stock',
    };
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
  //download simplre and detailed billed report
  const simpleBilledReportResponse = await downloadReport(
    page,
    'S',
    'simple_billed_report.xlsx',
    downloadPath
  );
  const detailedBilledReportReponse = await downloadReport(
    page,
    'D',
    'detailed_billed_report.xlsx',
    downloadPath
  );

  //await waitForDownload(10000);

  // Stock report
  await page.goto(`${process.env.CONTABILIUM_URL}/modulos/reportes/stock.aspx`);

  const stockReportResponse = await downloadStockReport(
    page,
    'stock_report.xlsx',
    downloadPath
  );

  //await waitForDownload(10000);

  return {
    simpleBilledReportResponse,
    detailedBilledReportReponse,
    stockReportResponse,
  };
};
