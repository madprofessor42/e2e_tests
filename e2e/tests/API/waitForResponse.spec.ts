const { test, expect} = require('@playwright/test');
const { webkit } = require('playwright');
const { baseTouch } = require('../../browsers');
import { Page, Request, Response } from 'playwright/test';


test.describe('Response', () => {
    test('Test response', async () => {
        const browser = await webkit.launch();
        const context = await browser.newContext(baseTouch);
        const page = await context.newPage();

        await page.goto('https://google.com/');


        await context.close();
    })
})


const apiFunc = {
    /**
     * Ожидает пока все ручки не ответят
     * @param page
     * @param endpoints
     * @param timeout
     */
    async waitUntilResponsesComplete(page: Page, endpoints: string[], timeout: number = 15000): Promise<void> {
        const waitPromise = Promise.all(
            endpoints.map(async endpoint => {
                return new Promise<void>(resolve => {
                    const listener = async (response: Response) => {
                        if (response.url().includes(endpoint) && response.status() === 200) {
                            resolve();
                            page.off('response', listener); // remove the event listener
                        }
                    };

                    page.on('response', listener);
                });
            })
        );

        const racePromise = Promise.race([
            waitPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
        ]);

        try {
            await racePromise;
        } catch (error) {
            throw new Error(`${error} - the page was not loaded in ${timeout/1000} seconds`);
        }
    },

    /**
     * Проверяем что шлем в реквесте. Ключи передаем через ?.
     * Вызываем следующим образом:
     * const requestPromise = indexPage.assertRequestBody(...)
     * await [действие которое вызывает запрос]
     * await requestPromise
     * @param page
     * @param endpoint
     * @param keys
     * @param values
     */
    async assertRequestBody(
        page: Page,
        endpoint: string,
        keys: string[],
        values: (string | number | boolean)[]
    ): Promise<void> {
        return new Promise<void>((resolve, _) => {
            let requestFound = false;

            const requestListener = async (request: Request) => {
                if (request.url().includes(endpoint) && ['POST', 'PATCH', 'PUT'].includes(request.method())) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const data = await request.postDataJSON();
                    let matchCount = 0;
                    const notMatched: Record<string, unknown> = {};

                    for (let i = 0; i < keys.length; i++) {
                        const receivedValue = eval(`data.${keys[i]}`);

                        if (receivedValue === values[i]) {
                            matchCount++;
                        } else {
                            notMatched[keys[i]] = values[i];
                        }
                    }

                    if (matchCount === keys.length) {
                        requestFound = true;
                    }

                    page.off('request', requestListener);

                    expect(
                        requestFound,
                        `Request body has incorrect values for the given keys. ${JSON.stringify(notMatched)}`
                    ).toBeTruthy();

                    resolve();
                }
            };

            page.on('request', requestListener);
        });
    },

    /**
     * Проверяем что приходит в ответе. Ключи передаем через ?.
     * Вызываем следующим образом:
     * const responsePromise = indexPage.assertResponseBody(...)
     * await [действие которое вызывает запрос]
     * await responsePromise
     * @param page
     * @param endpoint
     * @param keys
     * @param values
     */
    async assertResponseBody(
        page: Page,
        endpoint: string,
        keys: string[],
        values: (string | number | boolean)[]
    ): Promise<void> {
        return new Promise<void>((resolve, _) => {
            let responseFound = false;

            const responseListener = async (response: Response) => {
                if (
                    response.url().includes(endpoint) &&
                    ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(response.request().method())
                ) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const data = await response.json();
                    let matchCount = 0;
                    const notMatched: Record<string, unknown> = {};

                    for (let i = 0; i < keys.length; i++) {
                        const receivedValue = eval(`data.${keys[i]}`);

                        if (receivedValue === values[i]) {
                            matchCount++;
                        } else {
                            notMatched[keys[i]] = values[i];
                        }
                    }

                    if (matchCount === keys.length) {
                        responseFound = true;
                    }

                    page.off('response', responseListener);

                    expect(
                        responseFound,
                        `Response body has incorrect values for the given keys. ${JSON.stringify(notMatched)}`
                    ).toBeTruthy();

                    resolve();
                }
            };

            page.on('response', responseListener);
        });
    },

    /**
     * Ждет ожидание конкретного значения в ответе
     * @param page
     * @param endpoint
     * @param key
     * @param value
     * @param timeout
     */
    async waitUntilBodyKey(
        page: Page,
        endpoint: string,
        key: string,
        value: (string | number | boolean),
        timeout: number) {
        const startTime = Date.now();
        let responseFound = false;

        const responseListener = async (response: Response) => {
            if (
                response.url().includes(endpoint) &&
                response.status() === 200 &&
                response.headers()['content-type'].includes('application/json')
            ) {
                const jsonResponse = await response.json();

                if (jsonResponse.key === value) {
                    responseFound = true;
                }
            }
        };

        page.on('response', responseListener);

        while (!responseFound && Date.now() - startTime < timeout) {
            await page.waitForTimeout(1000); //Timeout
        }

        page.off('response', responseListener);

        if (!responseFound) {
            throw new Error(`The value is not ${value} after ${timeout}`);
        }
    }

}