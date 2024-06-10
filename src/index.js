import express from 'express';
import contabiliumScrapper from './scrapper/contabilium/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/contabilium-scrapper', async (req, res) => {
  res.send('Scrapping process started');
  try {
    const contabiliumScrapperResponse = await contabiliumScrapper();

    console.log({ contabiliumScrapperResponse });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
