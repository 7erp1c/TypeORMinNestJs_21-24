import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { SecurityModule } from './features/security/security.module';
import { TestingDeleteModule } from './features/testing/testingDeleteModule';
import { QuizModule } from './features/quiz/quiz.module';
import { postgresConfig } from './settings/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appSettings } from './settings/app-settings';

const throttleModule = ThrottlerModule.forRoot([
  {
    ttl: 10000,
    limit: 10000, //5
  },
]);

const appModules = [UsersModule, BlogsModule, SecurityModule, QuizModule];
//дабы не заюзать
if (appSettings.env.getEnv() === 'TESTING') {
  appModules.push(TestingDeleteModule);
}
@Module({
  // Регистрация модулей
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(postgresConfig),
    throttleModule,
    ...appModules,
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
