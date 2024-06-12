import 'dotenv/config';
import { uploadDetailledBilledReportToGoogleSheet } from './googleSheets/detailedBilledSheet.js';
import { uploadSimpleBilledReportToGoogleSheet } from './googleSheets/simpleBilledSheet.js';
import { uploadStockReportToGoogleSheet } from './googleSheets/stockSheet.js';
import contabiliumScrapper from './scrapper/contabilium/index.js';
import { sendMail } from './utils/mailer.js';

const PORT = process.env.PORT || 3000;
const EMAIL_RECIPIENTS = JSON.parse(process.env.EMAIL_RECIPIENTS);

async function scrapper() {
  console.log('Scrapping process started');
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
    return {
      contabiliumScrapperResponse,
    };
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
}

exports.handler = async (event, context) => {
  try {
    const response = await scrapper();
    return response;
  } catch (error) {
    console.error('Error in handler', error);
    return error;
  }
};
