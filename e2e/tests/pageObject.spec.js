const { test } = require('@playwright/test');
const { webkit } = require('playwright');

/**
 * Декомпозирует приложение на страницы. Что бы переиспользовать методы в тестах
 */

class MainPage {
    constructor(page) {
        this.page = page;
    }
    async clickLoginButton() {
        await this.page.getByText('Войти').click();
        await this.page.waitForTimeout(3000);
    }
}

class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async logIn(user, pass) {
        await this.page.getByPlaceholder('Логин или email').fill(user);
        await this.page.waitForTimeout(2000);
        await this.page.locator('xpath=//button//span[text()="Войти"]').click();
        await this.page.waitForTimeout(2000);
        await this.page.getByPlaceholder('Введите пароль').fill(pass);
        await this.page.waitForTimeout(2000);
        await this.page.locator('xpath=//button//span[text()="Войти"]').click();
        await this.page.waitForTimeout(4000);
    }
}


test('Page Object', async () => {
    const browser = await webkit.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://ya.ru');

    const mainPage = new MainPage(page);
    const loginPage = new LoginPage(page);

    await mainPage.clickLoginButton();
    await loginPage.logIn(secret.email, secret.password);
})