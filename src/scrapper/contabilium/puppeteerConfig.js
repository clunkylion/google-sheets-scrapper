import fs from 'fs';
import path from 'path';

export const setupPuppeteer = async (page, downloadPath) => {
  await page.setViewport({ width: 1280, height: 720 });
  fs.mkdirSync(downloadPath, { recursive: true });
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: path.resolve(downloadPath),
  });
};
