import 'dotenv/config';
import express from 'express';
import { uploadDetailledBilledReportToGoogleSheet } from './googleSheets/detailedBilledSheet.js';
import { uploadSimpleBilledReportToGoogleSheet } from './googleSheets/simpleBilledSheet.js';
import { uploadStockReportToGoogleSheet } from './googleSheets/stockSheet.js';
import contabiliumScrapper from './scrapper/contabilium/index.js';
import { sendMail } from './utils/mailer.js';

const app = express();
const PORT = process.env.PORT || 8080;
const EMAIL_RECIPIENTS = JSON.parse(process.env.EMAIL_RECIPIENTS);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/contabilium-scrapper', async (req, res) => {
  console.log('Scrapping process started');
  try {
    const contabiliumScrapperResponse = await contabiliumScrapper();

    console.log({ contabiliumScrapperResponse });

    if (!contabiliumScrapperResponse) {
      console.log('no response from contabilium scrapper');

      await sendMail(
        ['cote99salamanca@gmail.com'],
        'ERROR SCRAPPER CONTABILIUM - MOTOR OIL',
        `
          ERROR scrapper contabilium - Motor Oil ${new Date().toLocaleDateString()}
  
          ERROR:
           No se pudo obtener respuesta del scrapper de contabilium
           Volver a intentar el proceso.
        `
      );
      return res.send('no response from contabilium scrapper');
    }

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

    console.log({ googleSheetUpdateStatus: responseEmailData });

    await sendMail(
      EMAIL_RECIPIENTS,
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
    return res.send({
      contabiliumScrapperResponse,
    });
  } catch (error) {
    console.error({ error });
    await sendMail(
      EMAIL_RECIPIENTS,
      'ERROR SCRAPPER CONTABILIUM - MOTOR OIL',
      `
        ERROR scrapper contabilium - Motor Oil ${new Date().toLocaleDateString()}

        ERROR:
         ${error}
          Volver a intentar el proceso.
      `
    );
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
