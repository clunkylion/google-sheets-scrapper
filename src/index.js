import express from 'express';
import { uploadDetailledBilledReportToGoogleSheet } from './googleSheets/detailedBilledSheet.js';
import { uploadSimpleBilledReportToGoogleSheet } from './googleSheets/simpleBilledSheet.js';
import { uploadStockReportToGoogleSheet } from './googleSheets/stockSheet.js';
import contabiliumScrapper from './scrapper/contabilium/index.js';
import { sendMail } from './utils/mailer.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/contabilium-scrapper', async (req, res) => {
  res.send('Scrapping process started');
  try {
    const contabiliumScrapperResponse = await contabiliumScrapper();

    console.log({ contabiliumScrapperResponse });

    const responseEmailData = {
      stockReport: {
        message: contabiliumScrapperResponse.stockReportResponse.message,
      },
      simpleBilledReport: {
        message: contabiliumScrapperResponse.simpleBilledReportResponse.message,
      },
      detailedBilledReport: {
        message:
          contabiliumScrapperResponse.detailedBilledReportReponse.message,
      },
    };

    if (contabiliumScrapperResponse.stockReportResponse.success) {
      console.log('procesing Stock report  to google drive');
      const gdriveResponse = await uploadStockReportToGoogleSheet();
      responseEmailData.stockReport.message = gdriveResponse.message;
    }
    if (contabiliumScrapperResponse.simpleBilledReportResponse.success) {
      console.log('procesing simple billed report to google drive');
      const gdriveResponse = await uploadSimpleBilledReportToGoogleSheet();
      responseEmailData.simpleBilledReport.message = gdriveResponse.message;
    }
    if (contabiliumScrapperResponse.detailedBilledReportReponse.success) {
      console.log('procesing detailed billed report to google drive');
      const gdriveResponse = await uploadDetailledBilledReportToGoogleSheet();
      responseEmailData.detailedBilledReport.message = gdriveResponse.message;
    }
    await sendMail(
      'martinrioja@gmail.com',
      'RESULTADO SCRAPPER CONTABILIUM - MOTOR OIL',
      `
        Resultado scrapper contabilium - Motor Oil ${new Date().toLocaleDateString()}

        RESULTADOS: 
        - Stock: ${responseEmailData.stockReport.message}
        - Facturación Simple: ${responseEmailData.simpleBilledReport.message}
        - Facturación Detallada: ${
          responseEmailData.detailedBilledReport.message
        }

        Saludos cordiales
        pd: martin estoy haciendo pruebas.
      `
    );
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
