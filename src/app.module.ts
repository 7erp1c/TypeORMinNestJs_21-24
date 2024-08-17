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
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from './settings/app-settings';
import { QuizModule } from './features/quiz/quiz.module';
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
    limit: 5,
  },
]);

const typeOrmModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(<string>process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
  // logging: true,
  //ssl: true,
});
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
    typeOrmModule,
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
