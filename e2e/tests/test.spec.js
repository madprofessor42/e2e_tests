const { test, expect} = require('@playwright/test');
const { webkit } = require('playwright');

test.describe('Test', () => {
    test('Test Safari', async ({}, workerInfo) => {
        const browser = await webkit.launch();
        const context = await browser.newContext()

        const page = await context.newPage();
        await page.goto('https://taxi.yandex.ru');
        await page.waitForTimeout(10000);

        const userAgent = await page.evaluate(() => navigator.userAgent);
        console.log(userAgent);

        await expect(page).toHaveScreenshot('pageLoadedSafari.png');
        await context.close()
    })
})

