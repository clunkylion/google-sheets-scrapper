export const login = async (page) => {
  await page.goto(`${process.env.CONTABILIUM_URL}/v2/login`);

  await page.waitForSelector('#email');
  await page.type('#email', process.env.CONTABILIUM_EMAIL);

  await page.waitForSelector('#password');
  await page.type('#password', process.env.CONTABILIUM_PASSWORD);

  await page.waitForSelector('button');
  await Promise.all([
    page.click('button'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
};
