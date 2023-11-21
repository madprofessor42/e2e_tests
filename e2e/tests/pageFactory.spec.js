const { test } = require('@playwright/test');
const { webkit } = require('playwright');
const {waitForPageLoaded} = require("../commands/waits");

/**
 * Служит для генерации тестовых данных, зачастую для генерации селекторов
 */

class Selector {
    constructor(name) {
        this.selector = `xpath=(//*[@placeholder="${name}"] | //*[text()="${name}"])`
    }
}

test('Page Factory', async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://ya.ru');

    const searchField = new Selector('найдётся всё');
    await page.locator(searchField.selector).fill('Яндекс Такси');

    const findButton = new Selector('Найти');
    await page.locator(findButton.selector).click();
    await waitForPageLoaded(page, 1000);
})