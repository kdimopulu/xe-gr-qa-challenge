const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.xe.gr/property/s/enoikiaseis-katoikion');
  await page.waitForLoadState('networkidle');
  
  // Click on "ΠΕΡΙΣΣΟΤΕΡΕΣ ΕΠΙΛΟΓΕΣ" to reveal more options
  await page.click('#more-options-btn');
  await page.waitForTimeout(1000);
  
  // Get all input elements again
  const inputs = await page.$$eval('input', inputs => 
    inputs.map(input => ({
      type: input.type,
      name: input.name,
      placeholder: input.placeholder,
      className: input.className,
      id: input.id
    }))
  );
  
  console.log('All input elements after clicking more options:');
  console.log(JSON.stringify(inputs, null, 2));
  
  await browser.close();
})();
