import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import path from 'path';
import readXlsx from '../utils/readXlsx.js';
import deleteFile from '../utils/deleteFile.js';

const DOCUMENT_ID = process.env.DOCUMENT_ID;

const serviceAccountAuth = new JWT({
  email: process.env.CLIENT_EMAIL,
  key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const filePath = path.resolve('src/downloads/simple_billed_report.xlsx');

export const uploadSimpleBilledReportToGoogleSheet = async () => {
  try {
    const { data, headers } = await readXlsx(filePath);

    const customHeaderValues = ['ID', ...headers];

    const dataWithCustomId = data.map((row) => {
      return {
        ID: `${row.Tipo}${row.Numero}`,
        ...row,
      };
    });

    const document = new GoogleSpreadsheet(DOCUMENT_ID, serviceAccountAuth);

    await document.loadInfo();

    const sheet = document.sheetsByIndex[0];
    await sheet.setHeaderRow(customHeaderValues);
    const sheetRows = await sheet.getRows();

    // Get all the IDs from the google sheet
    const googleSheetsDataIds = new Set(
      sheetRows.map((row) => {
        const objectRow = row.toObject();
        return objectRow.ID;
      })
    );
    // Filter the data to upload only the rows that are not already in the google sheet
    const validateDuplicatesValues = dataWithCustomId.filter((row) => {
      return !googleSheetsDataIds.has(row.ID);
    });

    await deleteFile(filePath);

    if (validateDuplicatesValues && validateDuplicatesValues.length > 0) {
      await sheet.addRows(validateDuplicatesValues);
      return {
        success: true,
        message: 'Reporte de facturación simple actualizado correctamente',
      };
    }

    return {
      success: true,
      message:
        'No hay nuevos datos para actualizar en el reporte de facturación simple',
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: 'Error al actualizar el reporte de facturación simple',
    };
  }
};
