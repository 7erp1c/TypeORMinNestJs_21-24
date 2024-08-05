import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserOutputDto } from '../../src/features/users/api/models/output/output';

export class UsersUtilRegistrationManager {
  private appIn: any;

  constructor(protected readonly app: INestApplication) {
    this.appIn = this.app.getHttpServer();
  }
  CreateUserThroughRegistration = async () => {
    const createUser = await request(this.appIn)
      .post('/auth/registration')
      .send({
        login: 'Ratmir',
        password: 'qwerty123',
        email: 'ul_tray@bk.ru',
      })
      .expect(204);
    return createUser.body;
  };
  //генерим много юзеров
  CreateUsersThroughRegistration = async (count: number) => {
    const users: UserOutputDto[] = [];
    for (let i = 1; i <= count; i++) {
      const createUser = await request(this.appIn)
        .post('/auth/registration')
        .send({
          login: '_I147aKCJ' + i,
          password: 'qwerty123',
          email: `ul_tray${i}@bk.ru`,
        })
        .expect(204);

      users.push(createUser.body);
    }
    return users;
  };
  // export const findRecoveryCode = async (email: string) => {
  //   const findUser = await UserModel.findOne({ 'accountData.email': email });
  //   const code = findUser?.recoveryPassword?.recoveryCode;
  //
  //   return code;
  // };

  user1 = {
    login: '_I147aKCJ',
    password: '123456',
    email: 'ul_tray@bk.ru',
  };
  dataSendLetter = {
    email: 'ul_tray@bk.ru',
  };
  userEmail = 'ul_tray@bk.ru';
  oldPassword = 'qwerty123';
  newPassword = 'qwerty1234';
}
