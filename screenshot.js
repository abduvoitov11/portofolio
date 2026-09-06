import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('https://optom-six.vercel.app/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/home/torabek/portfolio-red3/public/images/kiloli-optom.png' });
  
  await browser.close();
  console.log('Screenshot taken!');
})();
