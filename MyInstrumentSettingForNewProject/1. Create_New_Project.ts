/*
step1: yarn init --yes,
step2: yarn add express dotenv,
step3:
yarn add nodemon typescript ts-node @types/node @types/express jest ts-jest @types/jest supertest @types/supertest --dev,
step4: yarn tsc --init
step5: yarn ts-jest config:init
step6: yarn add jest ts-jest @types/jest supertest @types/supertest
step7: yarn add express-validator
step7: yarn add mongodb
step8: yarn add bcrypt @types/bcrypt --dev 
step9: yarn add express-jwt //создание old-token
step9: yarn add nodemailer @types/nodemailer --dev// для настройки отправки писем при регистрации
step10: yarn add uuid  @types/uuid --dev // это функция для генерации UUID (Universally Unique Identifier) версии 4. Обычно она используется для создания уникальных идентификаторов в приложениях.
step11: yarn add date-fns @types/date-fns --dev //работа с датами
step11: yarn add cookie-parser @types/cookie-parser --dev // Проинсталлировать cookie-parser:
step12: yarn add mongodb-memory-server @types/mongodb-memory-server //для тестов если реализовывать временное бд
step13: yarn add express-useragent @types/express-useragent --save
step14: yarn add base-64  @types/base-64
step15: yarn add mongoose
step16: yarn add inversify @types/inversify | yarn add reflect-metadata //IOC контейнер

tsconfig.json:
 */
// {
//     "compilerOptions": {
//         "target": "es2016",
//         "module": "commonjs",
//         "outDir": "./dist",
//         "allowSyntheticDefaultImports": true,
//         "esModuleInterop": true,
//         "forceConsistentCasingInFileNames": true,
//         "strict": true,
//         "noImplicitReturns": true,
//         "skipLibCheck": true
//     },
//     "include": ["src/**//*"],
// "exclude": ["node_modules", "**//*.test.ts"]
// }
//package.json:
//
// "scripts": {
//     "watch": "tsc -w",
//         "dev": "yarn nodemon --inspect dist/index.js",
//         "test": "jest -i"
// },
//

//jest-e2e.ts:
/*
* @typeForReqRes {import('ts-jest').JestConfigWithTsJest}
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 100000,
    testRegex: '.e2e.test.ts$'
};
*/
