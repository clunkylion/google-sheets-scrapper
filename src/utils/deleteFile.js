import { promises as fs } from 'fs';
export default async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log('File deleted successfully');
  } catch (error) {
    console.log(error);
  }
}
