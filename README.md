# e2e_tests

1. Скачиваем docker (если хотим в докере запустить тесты) - https://www.docker.com/get-started/
2. npm install
3. npm run docker - запустится контейнер. Внутри контейнера npm run mobile_safari - запустить тесты
4. Можно сразу сделать npm run mobile_safari, что бы запустить тесты локально, не в докере
5. npm run report - открыть отчет


# Запуск тестов
`npx playwright test --ui` - открыть GUI режим
`npx playwright test названиеФайла --headed` - запустить тест в браузере

