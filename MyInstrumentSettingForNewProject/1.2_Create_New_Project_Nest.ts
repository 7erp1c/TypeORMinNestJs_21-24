/*
 1. Прописываем в терминале cmd или powershell: ` yarn global add @nestjs/cli `
~ если  после глобальной установки через yarn: yarn global add @nestjs/cli не получается
выполнить команду nest, nest -v и прочее, установите nest через npm:
npm install -g @nestjs/cli и перезапустите терминал
~ МакОС/Линукса, через sudo: sudo npm install -g @nestjs/cli
~ Если после установки: yarn global add @nestjs/cli, вызываете nest, выдает ошибку nest:
command not found, то нужно прописать переменные среды в PATH. Находите путь к nest,
на винде он должен быть что-то вроде этого C:\Users\Name\AppData\Local\Yarn\bin
и добавляете этот путь в переменные среды PATH.
2. Открываем терминал в нужной папке, прописываем: nest new Название проекта
3. что бы не было проблем с корреткой добавь в .eslintrc.js
rules{...,
'prettier/prettier': [ "error",
      { "endOfLine": "auto" }
    ]
}
  *
________________________________git add . & git commit -m "initial commit" потом второй
абзац с GitHub
  *
4. app.enableCors(); в main.ts
5. yarn add class-transformer class-validator @nestjs/swagger @nestjs/mongoose mongoose
6. yarn add @nestjs/throttler является видом защитника, который обеспечивает ограничение частоты запросов (throttling) к API или другому ресурсу.
7. yarn add @nestjs/jwt
8. тесты: yarn add jest @types/jest ts-jest mongodb-memory-server -D
9. yarn add @nestjs/typeorm typeorm pg
10.  yarn add @nestjs/cqrs
*/
