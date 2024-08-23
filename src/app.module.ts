import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { SecurityModule } from './features/security/security.module';
import { TestingModule } from './features/testing/testing.module';
import process from 'process';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from './settings/app-settings';
import { QuizModule } from './features/quiz/quiz.module';
import { postgresConfig } from './settings/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
//const URI = appSettings.api.MONGO_CONNECTION_URI;
//console.log(URI, 'URI**');

const mongoModule = MongooseModule.forRoot(
  appSettings.env.isTesting()
    ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
    : appSettings.api.MONGO_CONNECTION_URI,
);
const throttleModule = ThrottlerModule.forRoot([
  {
    ttl: 10000,
    limit: 10000, //5
  },
]);

const appModules = [UsersModule, BlogsModule, SecurityModule, QuizModule];
//дабы не заюзать
if (process.env.ENV !== 'PRODUCTION') {
  appModules.push(TestingModule);
}
@Module({
  // Регистрация модулей
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(postgresConfig),
    mongoModule,
    throttleModule,
    ...appModules,
    // TestingModule.register(),
  ],
  providers: [],
  controllers: [],
})
export class AppModule implements NestModule {
  // https://docs.nestjs.com/middleware#applying-middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(cookieParser() as any)
      .forRoutes('*');
  }
}
