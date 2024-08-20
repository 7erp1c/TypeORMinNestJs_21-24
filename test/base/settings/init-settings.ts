import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/settings/app-settings';
import request from 'supertest';
import supertest from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresConfig } from '../../../src/settings/postgres.config';
import { ConfigModule } from '@nestjs/config';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  console.log('in tests ENV: ', appSettings.env.getEnv());
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot(),
      TypeOrmModule.forRoot(postgresConfig),
      AppModule,
    ],
    //providers: [UsersService, UsersRepository, BcryptAdapter],
  });
  // .overrideProvider('')
  // .useValue('');

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  await app.init();
  const httpServer = app.getHttpServer();

  const databaseConnection =
    await request(httpServer).delete('/testing/all-data');

  const agent = supertest.agent(app.getHttpServer());
  await agent.delete('/testing/all-data');

  return {
    app,
    databaseConnection,
    httpServer,
    agent,
  };
};
