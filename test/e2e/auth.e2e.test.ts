import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  afterEach,
} from '@jest/globals';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { applyAppSettings } from '../../src/settings/apply-app-setting';
import { UserCreateInputModel } from '../../src/features/users/api/models/input/create.user.input.model';
import { AuthTestManager } from '../util/auth.test.manager';
import request from 'supertest';
import { LoginOrEmailInputModel } from '../../src/features/security/auth/api/model/input/loginOrEmailInputModel';
import { AuthService } from '../../src/features/security/auth/aplication/auth.service';

// const TEST_ADMIN_CREDENTIALS = {
//   login: 'admin',
//   password: 'qwerty',
// };
describe('test AuthService', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useClass(AuthService)
      .compile();
    //создаём nest приложение
    app = moduleFixture.createNestApplication();
    // Применяем все настройки приложения (pipes, guards, filters, ...)
    applyAppSettings(app);
    //инициируем приложение
    await app.init();
    // Init authTestManager
    authTestManager = new AuthTestManager(app);

    // const loginResult = await userTestManger.login(
    //   TEST_ADMIN_CREDENTIALS.login,
    //   TEST_ADMIN_CREDENTIALS.password,
    // );
    //
    // // Работа с состоянием
    // expect.setState({
    //   adminTokens: loginResult,
    // });
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data');
    await app.close();
  });

  afterEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data');
  });
  describe('RegisrationUser', () => {
    it('plug', async () => {
      expect(1).toBe(1);
    });
    it('/ registration $ logIn user tests (POST)', async () => {
      await request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
      //const {adminTokens} = expect.getState();
      // Work with state
      const createModel: UserCreateInputModel = {
        login: 'I14fg7ad',
        password: 'qwerty123',
        email: 'ul_tray@bk.ru',
      };
      const loginModel: LoginOrEmailInputModel = {
        loginOrEmail: 'ul_tray@bk.ru',
        password: 'qwerty123',
      };
      await authTestManager.createUser(createModel);
      const responseLogin = await authTestManager.login(loginModel);
      expect(responseLogin).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });
});
