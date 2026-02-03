const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.xe.gr/property/s/enoikiaseis-katoikion');
  await page.waitForLoadState('networkidle');
  
  // Get all input elements
  const inputs = await page.$$eval('input', inputs => 
    inputs.map(input => ({
      type: input.type,
      name: input.name,
      placeholder: input.placeholder,
      className: input.className,
      id: input.id
    }))
  );
  
  console.log('All input elements:');
  console.log(JSON.stringify(inputs, null, 2));
  
  // Get all buttons
  const buttons = await page.$$eval('button, input[type="submit"]', elements => 
    elements.map(el => ({
      type: el.type,
      text: el.textContent || el.value,
      className: el.className,
      id: el.id
    }))
  );
  
  console.log('\nAll buttons:');
  console.log(JSON.stringify(buttons, null, 2));
  
  await browser.close();
})();
