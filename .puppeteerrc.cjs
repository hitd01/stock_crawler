const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

/**
 * es6
 */
// import { join } from 'path';

// /**
//  * @type {import("puppeteer").Configuration}
//  */
// const config = {
//   // Changes the cache location for Puppeteer.
//   cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
// };
// export default config;
