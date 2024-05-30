import { read, utils } from 'xlsx';
import { promises as fs } from 'fs';

export default async function readXlsx(filePath) {
  const fileBuffer = await fs.readFile(filePath);

  const workbook = read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonSheet = utils.sheet_to_json(worksheet, { header: 1 });
  const data = utils.sheet_to_json(worksheet);

  const headers = jsonSheet[0];

  return { headers, data, length: data.length };
}
