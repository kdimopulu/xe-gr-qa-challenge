const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Just go to the page and wait a bit
  await page.goto('https://www.xe.gr/property/s/enoikiaseis-katoikion');
  await page.waitForTimeout(5000);
  
  // Get all elements with test ids
  const elementsWithTestId = await page.$$eval('[data-testid]', elements => 
    elements.map(el => ({
      tag: el.tagName,
      testId: el.getAttribute('data-testid'),
      className: el.className,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder,
      type: el.type,
      text: el.textContent?.trim()
    }))
  );
  
  console.log('All elements with data-testid:');
  console.log(JSON.stringify(elementsWithTestId, null, 2));
  
  await browser.close();
})();
