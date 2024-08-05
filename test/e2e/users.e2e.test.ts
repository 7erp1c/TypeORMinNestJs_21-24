import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { initSettings } from '../util/init-settings';
import { UsersService } from '../../src/features/users/application/users.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserServiceMock } from '../__mocks__/users.service.mock';
import { FindsAll } from '../util/findsAll';
import { DataSource } from 'typeorm';

describe('test AuthService', () => {
  let app: INestApplication;
  let findsAll: FindsAll;
  // let httpServer;
  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder.overrideProvider(UsersService).useClass(UserServiceMock);
    });
    app = result.app;
    const dataSource = app.get(DataSource);
    findsAll = new FindsAll(dataSource);
    // httpServer = result.httpServer;
  });
  // afterEach(async () => {
  //   await request(app.getHttpServer()).delete('/testing/all-data');
  // });
  afterAll(async () => {
    //await request(app.getHttpServer()).delete('/testing/all-data');
    await app.close();
    // const jestSpyAuthApi = jest
    //   .spyOn(AdminAuthGuard.prototype, 'fetchTokenData')
    //   .mockResolvedValue(tokenData);
  });

  describe('plug', () => {
    it('test', () => {
      expect(true).toBe(true);
    });
  });

  describe('testUsersEndpoint', () => {
    it(' - create user for test posts', async () => {
      const createUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'Ratmir',
          password: 'qwerty123',
          email: 'ul-tray@bk.ru',
        })
        .expect(HttpStatus.CREATED);
      expect(createUser.body).toMatchObject({
        createdAt: expect.any(String),
        email: expect.any(String),
        id: expect.any(String),
        login: expect.any(String),
      });
    });
  });
  describe(' users create delete update', () => {});
  it('registration user', async () => {
    const regU = await request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({
        login: 'test1',
        password: 'test123',
        email: 'ul-trayy@bk.ru',
      })
      .expect(HttpStatus.CREATED);
    expect(regU.body).toMatchObject({
      createdAt: expect.any(String),
      email: expect.any(String),
      id: expect.any(String),
      login: expect.any(String),
    });
  });
  it('delete user', async () => {
    const email = 'ul-trayy@bk.ru';
    const userId = await findsAll.findUserId(email);
    await request(app.getHttpServer())
      .delete(`/sa/users/${userId}`)
      .auth('admin', 'qwerty')
      .expect(204);
  });
});
