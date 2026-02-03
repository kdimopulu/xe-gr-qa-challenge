const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.xe.gr/property/s/enoikiaseis-katoikion');
  await page.waitForTimeout(5000);
  
  // Get all elements with test ids, focusing on search/filter related ones
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
    })).filter(el => 
      el.testId && (
        el.testId.includes('search') ||
        el.testId.includes('filter') ||
        el.testId.includes('price') ||
        el.testId.includes('size') ||
        el.testId.includes('sqm') ||
        el.testId.includes('area') ||
        el.testId.includes('option') ||
        el.testId.includes('more') ||
        el.testId.includes('input') ||
        el.testId.includes('min') ||
        el.testId.includes('max')
      )
    )
  );
  
  console.log('Search/Filter-related elements with data-testid:');
  console.log(JSON.stringify(elementsWithTestId, null, 2));
  
  await browser.close();
})();
