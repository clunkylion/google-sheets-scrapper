import contabiliumScrapper from './scrapper/contabilium/index.js';

const runScrapper = async () => {
  try {
    await contabiliumScrapper();
  } catch (error) {
    console.error(error);
  }
};

runScrapper();
