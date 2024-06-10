import express from 'express';
import contabiliumScrapper from './scrapper/contabilium/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

const runScrapper = async () => {
  try {
    await contabiliumScrapper();
  } catch (error) {
    console.error(error);
  }
};

app.get('/contabilium-scrapper', async (req, res) => {
  res.send('Scrapping process started');
  await runScrapper();
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
