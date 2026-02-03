import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Navigate directly to results page
    await page.goto('https://www.xe.gr/property/results?transaction_name=rent&item_type=re_residence');
    await page.waitForLoadState('networkidle');

    // Handle cookie consent
    try {
        await page.locator('#accept-btn').click();
        await page.waitForTimeout(2000);
    } catch (error) {
        // No cookie consent modal found
    }

    // Search for Παγκράτι
    await page.getByTestId('area-input').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('area-input').fill('Παγκράτι');
    await page.waitForTimeout(1000);
    
    // Submit search
    await page.getByTestId('submit-input').click();
    await page.waitForTimeout(2000);

    // Apply price filter
    await page.getByTestId('price-filter-button').click();
    await page.waitForTimeout(1000);
    await page.getByTestId('minimum_price_input').fill('200');
    await page.getByTestId('maximum_price_input').fill('700');
    await page.waitForTimeout(2000);

    // Apply size filter and validate
    await page.getByTestId('size-filter-button').click();
    await page.waitForTimeout(1000);
    await page.getByTestId('minimum_size_input').fill('75');
    await page.waitForTimeout(500); // Wait after min size input
    await page.getByTestId('maximum_size_input').fill('150');
    await page.waitForTimeout(500); // Wait after max size input
    await page.keyboard.press('Tab'); // Ensure input loses focus
    await page.waitForTimeout(3000); // Wait for filter to apply
});

test('xe.gr property search test', async ({ page }) => {
    test.setTimeout(120000);

    const adElements = await page.locator('[data-testid="property-ad-price"]').all();
    expect(adElements.length).toBeGreaterThan(0);

    let validPrices = 0;
    let validSizes = 0;
    const adsToCheck = adElements.length; // Check ALL results

    for (let i = 0; i < adsToCheck; i++) {
        // Test price range (€200-€700)
        const priceText = await adElements[i].textContent();
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        if (price >= 200 && price <= 700) {
            validPrices++;
        }

        // Test size range (75-150m²) from title
        const titleElement = page.locator('[data-testid="property-ad-title"]').nth(i);
        const titleText = await titleElement.textContent();
        
        const sizeMatch = titleText.match(/(\d+)\s*(?:τ\.μ\.|sq\.m\.)/i);
        if (sizeMatch) {
            const size = parseInt(sizeMatch[1]);
            if (size >= 75 && size <= 150) {
                validSizes++;
            }
        }
        
        // Add a small delay between ads to avoid timing issues
        await page.waitForTimeout(500);
    }
    
    // All ads must have prices within filter range
    expect(validPrices).toBe(adsToCheck);
    
    // All ads must have sizes within filter range
    expect(validSizes).toBe(adsToCheck);
});

test('xe.gr sorting by descending price test', async ({ page }) => {
    test.setTimeout(120000);

    const adElements = await page.locator('[data-testid="property-ad-price"]').all();
    
    if (adElements.length < 2) {
        test.skip();
        return;
    }

    const pricesBefore: number[] = [];
    for (let i = 0; i < adElements.length; i++) {
        const priceText = await adElements[i].textContent();
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        if (price > 0) {
            pricesBefore.push(price);
        }
    }

    await page.click('body');
    await page.waitForTimeout(500);
    await page.getByTestId('open-property-sorting-dropdown').click({ force: true });
    await page.waitForTimeout(1000);
    await page.getByTestId('price_desc').click();
    await page.waitForTimeout(2000);

    const adElementsAfter = await page.locator('[data-testid="property-ad-price"]').all();
    const pricesAfter: number[] = [];
    
    for (let i = 0; i < adElementsAfter.length; i++) {
        const priceText = await adElementsAfter[i].textContent();
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        if (price > 0) {
            pricesAfter.push(price);
        }
    }

    if (pricesAfter.length >= 2) {
        const isSorted = pricesAfter.every((price, index) => {
            if (index === 0) return true;
            return price <= pricesAfter[index - 1];
        });
        
        expect(isSorted).toBeTruthy();
    }
});

test('xe.gr picture count validation test', async ({ page }) => {
    test.setTimeout(120000);

    const adElements = await page.locator('[data-testid="property-ad-price"]').all();
    expect(adElements.length).toBeGreaterThan(0);
    
    let adsExceedingLimit = 0;
    const adsToCheck = Math.min(3, adElements.length);
    
    for (let i = 0; i < adsToCheck; i++) {
        const adElement = adElements[i];
        await adElement.scrollIntoViewIfNeeded();
        
        // Count arrows (indicates multiple pictures)
        const arrows = await adElement.locator('[data-testid="slick-arrow"]').all();
        const arrowCount = arrows.length;
        
        // If no arrows, count images directly
        const pictureCount = arrowCount > 0 ? arrowCount : (await adElement.locator('img').all()).length;
        
        if (pictureCount > 30) {
            adsExceedingLimit++;
        }
    }
    
    expect(adsExceedingLimit).toBe(0);
});

test('xe.gr phone visibility test', async ({ page }) => {
    test.setTimeout(120000);

    // Verify no phones are visible on search results page
    const phonesOnSearchPage = page.getByTestId('phones');
    expect(await phonesOnSearchPage.isVisible()).toBe(false);

    // Click first ad to open details
    const firstAdUrl = page.locator('[data-testid="property-ad-url"]').first();
    await firstAdUrl.click();
    await page.waitForTimeout(2000);
    
    // Verify phone is not visible before clicking button
    const phoneElement = page.getByTestId('phones');
    expect(await phoneElement.isVisible()).toBe(false);
    
    // Click phone button to reveal phone
    const phoneButton = page.getByTestId('call-action-button');
    await phoneButton.click();
    await page.waitForTimeout(3000);
    
    // Verify phone is now visible and has valid format
    expect(await phoneElement.isVisible()).toBe(true);
    const phoneText = await phoneElement.textContent();
    expect(phoneText).toMatch(/\d{10}/);
});
