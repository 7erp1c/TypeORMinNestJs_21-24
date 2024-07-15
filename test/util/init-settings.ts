import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-setting';
import { appSettings } from '../../src/settings/app-settings';
import { UsersTestManager } from './users.test.manager';
import request from 'supertest';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  console.log('in tests ENV: ', appSettings.env.getEnv());
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
    //providers: [UsersService, UsersRepository, BcryptAdapter],
  });
  // .overrideProvider('')
  // .useValue('');

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  applyAppSettings(app);

  await app.init();
  const httpServer = app.getHttpServer();

  const databaseConnection =
    await request(httpServer).delete('/testing/all-data');

  const userTestManger = new UsersTestManager(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
  };
};
