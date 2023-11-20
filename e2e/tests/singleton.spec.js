const { test } = require('@playwright/test');
const { webkit } = require('playwright');
const secret = require('../secret.json');

// https://playwright.dev/docs/test-retries#reuse-single-page-between-tests

/**
 * In this example, we create a singleton Browser class that wraps the Playwright browser instance.
 * The getInstance() method ensures that we only create one instance of the browser throughout the execution of the script.
 * Subsequent calls to getInstance() will return the existing instance rather than creating a new one.
 *
 * By using this singleton pattern, we can ensure that all the test scripts in our automation suite use the same browser instance,
 * avoiding unnecessary overhead and ensuring consistency in testing.
 *
 * Применяется для расшаривания ресурсов (тех же тестовых конфигураций), или экземпляров страницы или браузера, на несколько тест-кейсов.
 * Это полезно, когда понадобилось создать глобальные конфигурации запуска тестов, например для проверки отдельных геолокаций.
 */
class BrowserSingleton {
    constructor() {
        if (!BrowserSingleton.instance) {
            BrowserSingleton.instance = this;
        }
        return BrowserSingleton.instance;
    }

    async getInstance() {
        if (!this.instance) {
            this.instance = await webkit.launch();
        }
        return this.instance;
    }
}

// Создаем общий инстанс браузера (контекст будет един во всех тестах)
// Задаем глобально page, что бы потом в хуке beforeAll переопределить глобальную страницу, а не создать новую внутри скоупа
let page;
let context;
test.beforeAll(async () => {
    const browser = await new BrowserSingleton().getInstance();
    context = await browser.newContext();
    page = await context.newPage();
})
test.afterAll(async () => {
    await context.close();
    await page.close();
})

// Устанавлвием опцию, что бы тесты шли друг за другом
test.describe.configure({mode: 'serial'});

// Пытаемся создать несколько инстансов браузера и сравнить их
test('Check instances', async () => {
    const browser1 = await new BrowserSingleton().getInstance();
    const browser2 = await new BrowserSingleton().getInstance();

    console.log(browser1 === browser2); // Output: true (both instances are the same)

})

test('Singleton Pattern', async () => {
    await page.goto('https://ya.ru/')
    await page.getByText('Войти').click();
    await page.waitForTimeout(3000);
    await page.getByPlaceholder('Логин или email').fill(secret.email);
    await page.waitForTimeout(2000);
    await page.locator('xpath=//button//span[text()="Войти"]').click();
    await page.waitForTimeout(2000);
    await page.getByPlaceholder('Введите пароль').fill(secret.password);
    await page.waitForTimeout(2000);
    await page.locator('xpath=//button//span[text()="Войти"]').click();
    await page.waitForTimeout(4000);
});

test('Singleton Pattern Second', async () => {
    await page.goto('https://ya.ru/')
    await page.waitForTimeout(4000);
});




