import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../common/exception-filters/http-exception-filter';
import { appSettings } from './app-settings';
import { LoggerMiddlewareFunc } from '../common/middlewares/logger.middleware';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';
interface CustomError {
  field: string;
  message: string;
}
// Префикс нашего приложения (http://site.com/api)
const APP_PREFIX = '/';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
  // Для внедрения зависимостей в validator constraint
  // {fallbackOnErrors: true} требуется, поскольку Nest генерирует исключение,
  // когда DI не имеет необходимого класса.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Применение глобальных Interceptors
  // app.useGlobalInterceptors()

  // Применение глобальных Guards
  //  app.useGlobalGuards(new AuthGuard());

  // Применить middleware глобально
  app.use(LoggerMiddlewareFunc);

  // Установка префикса
  setAppPrefix(app);

  // Конфигурация swagger документации
  setSwagger(app);

  // Применение глобальных pipes
  setAppPipes(app);

  // Применение глобальных exceptions filters
  setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
  // Устанавливается для разворачивания front-end и back-end на одном домене
  // https://site.com - front-end
  // https://site.com/api - backend-end
  app.setGlobalPrefix(APP_PREFIX);
};

const setSwagger = (app: INestApplication) => {
  if (!appSettings.env.isProduction()) {
    const swaggerPath = APP_PREFIX + 'swagger-doc';

    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .addBearerAuth()
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Blogger Swagger',
    });
  }
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    //для правильного отображения ошибок, настраиваем useGlobalPipes
    new ValidationPipe({
      // Для работы трансформации входящих данных
      transform: true,
      // Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      // Фабрика, перехватываем ошибку, кастомизируем её и выкидываем 400 с собранными данными
      exceptionFactory: (errors) => {
        console.log('*** *', errors);
        const customErrors: CustomError[] = [];
        errors.forEach((e) => {
          //Происходит перебор каждой ошибки e в исходном массиве,
          //достаём данные из errors.constraints и преобразуем в массив
          const constraintKeys = Object.keys(e.constraints!); //Для каждой ошибки извлекается объект constraints, и его ключи преобразуются в массив строк constraintKeys.
          constraintKeys.forEach((cKey) => {
            // Каждый ключ cKey из массива constraintKeys перебирается внутри вложенного цикла.
            const msg = e.constraints![cKey]; //Сохраняется сообщение об ошибке для конкретного ключа cKey из constraints.
            customErrors.push({ field: e.property, message: msg }); // Для каждого ключа cKey создается новый объект с полями field (свойство property из исходной ошибки) и message (сообщение об ошибке из constraints), который затем добавляется в массив customErrors.
          });
        });
        // Error 400
        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
};
