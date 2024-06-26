import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import path from 'path';
import readXlsx from '../utils/readXlsx.js';
import deleteFile from '../utils/deleteFile.js';

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64')
    .toString()
    .replace(/\n/g, '')
);

const serviceAccountAuth = new JWT({
  email: credential.client_email,
  key: credential.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const DOCUMENT_ID = process.env.DOCUMENT_ID;

const filePath = path.resolve('src/downloads/stock_report.xlsx');

export const uploadStockReportToGoogleSheet = async () => {
  try {
    const { data } = await readXlsx(filePath);

    const document = new GoogleSpreadsheet(DOCUMENT_ID, serviceAccountAuth);
    await document.loadInfo();

    const sheet = document.sheetsByIndex[2];
    await sheet.clearRows();
    await sheet.addRows(data);

    await deleteFile(filePath);

    return {
      success: true,
      message: 'Reporte de stock actualizado correctamente',
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: 'Error al actualizar el reporte de stock',
    };
  }
};
