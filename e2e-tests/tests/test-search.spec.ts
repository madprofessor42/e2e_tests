import { searchTest as test } from './tests';

test.beforeEach(async ({ yaHomePage }) => {
  await yaHomePage.visit('/');
});

test('Enter "Яндекс" in search bar, press "Найти" - should be opened search results', async ({ yaHomePage }) => {

  /* test steps */

});
