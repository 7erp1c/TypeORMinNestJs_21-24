//serveo ssh -R 80:localhost:*PORT* serveo.net

//Vercel:
//1) add file vercel.json
//2) copy code:
/*
{
    "version": 2,
    "name": "music-album",
    "builds": [
    { "src": "app.js",
     "use": "@vercel/node" }
],
    "routes": [
    { "src": "/(.*)",
     "dest": "/app.js" }
]
}
*/
//deploy on Render:
// 1. Заходим на https://render.com/, создаём новый аккаунт через GitHub
//     2. На вкладке Dashboard выбираем New Web Service
// 3. Выбираем нужный репозиторий, попадаем на страницу создания сервиса
//
// Name: выбираем произвольное имя
// Region: скорее всего любой, но лучше выбрать тот, который ближе к вам географически. Я выбрал Frankfurt
// Branch: ваша ветка
// Root Dir: оставляем пустое поле
// Runtime: Node
// Build Command: yarn install --frozen-lockfile; yarn tsc
// Start Command: nodemon --inspect dist/index.js
//
// Выбираем бесплатный тариф, нажимаем Advanced
//
// Нам необходимо прописать переменные окружения:
//
//     а. NODE_VERSION <версия Node.JS, используемая в проекте> (можно узнать, запустив в терминале команду node -v. Пример значения ==> 19.7.0)
// б. MONGO_URI <ваша ссылка на подключение к MongoDB, mongodb+srv:.....>
//
// Если не хотите хранить логин и пароль отправителя в открытом виде, можно их в коде указать как:
//
//     process.env.EMAIL,
//         process.env.EMAIL_PASSWORD,
//
//         после чего в настройках переменных окружения добавить:
//
//     EMAIL ПОЧТА_ОТПРАВИТЕЛЯ
// EMAIL_PASSWORD ПАРОЛЬ_ОТПРАВИТЕЛЯ
//
// 4. Больше никакие настройки менять не нужно, скроллим до конца страницы, нажимаем Create Web Service
// 5. Ждём деплой. Он здесь гораздо более медленный, чем на Vercel, запаситесь терпением :)
//
// Удачного деплоя!