import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserCreateInputModel } from '../../src/features/users/api/models/input/create.user.input.model';
import request from 'supertest';
import { LoginOrEmailInputModel } from '../../src/features/security/auth/api/model/input/loginOrEmailInputModel';

export class AuthTestManager {
  constructor(protected readonly app: INestApplication) {}
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  //expectCorrectModel(loginModel: any, createResponseLogin: any) {}
  async createUser(inputModelDto: UserCreateInputModel) {
    return request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(inputModelDto)
      .expect(HttpStatus.NO_CONTENT);
  }

  async login(
    inputModel: LoginOrEmailInputModel,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(inputModel)
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0]
        .split('=')[1]
        .split(';')[0],
    };
  }
}
