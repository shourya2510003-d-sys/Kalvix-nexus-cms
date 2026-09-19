const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('HTTP ERROR:', response.status(), response.url());
  });

  await page.goto('http://localhost:4321', { waitUntil: 'domcontentloaded' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
})();
