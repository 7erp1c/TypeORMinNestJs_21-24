import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { AuthTestManager } from '../../util/auth.test.manager';
import { UserCreateInputModel } from '../../../src/features/users/api/models/input/create.user.input.model';
import { LoginOrEmailInputModel } from '../../../src/features/security/auth/api/model/input/loginOrEmailInputModel';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../../src/features/quiz/questions/domain/quiz.question.entity';
import { ormConfig } from '../../base/settings/postgres.test.config';

const createModel1: UserCreateInputModel = {
  login: 'I14fg7ada',
  password: 'qwerty123a',
  email: 'ul_tray@bk.rua',
};
const loginModel1: LoginOrEmailInputModel = {
  loginOrEmail: 'ul_tray@bk.rua',
  password: 'qwerty123a',
};

const createModel2: UserCreateInputModel = {
  login: 'I14fg7adu',
  password: 'qwerty1233u',
  email: 'ul_tray@bk.ruu',
};
const loginModel2: LoginOrEmailInputModel = {
  loginOrEmail: 'ul_tray@bk.ruu',
  password: 'qwerty1233u',
};
describe('quizV1', () => {
  let server;
  let app: INestApplication;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormConfig), AppModule],
    }).compile();
    //создаём nest приложение
    app = moduleFixture.createNestApplication();

    // Применяем все настройки приложения (pipes, guards, filters, ...)
    applyAppSettings(app);
    //инициируем приложение
    await app.init();
    // Init authTestManager
    authTestManager = new AuthTestManager(app);
    server = request(app.getHttpServer());
    await server.delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create user,login, create 5 questions, connect game, 6 answer firsts user  ', () => {
    let refreshToken1: string;
    let refreshToken2: string;

    it('Clear db reg user', async () => {
      await server.delete('/testing/all-data').expect(HttpStatus.NO_CONTENT);

      await authTestManager.createUser(createModel1);
      const responseLogin1 = await authTestManager.login(loginModel1);
      expect(responseLogin1).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      await authTestManager.createUser(createModel2);
      const responseLogin2 = await authTestManager.login(loginModel2);
      expect(responseLogin2).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      refreshToken1 = responseLogin1.refreshToken;
      refreshToken2 = responseLogin2.refreshToken;
    });

    it('Should create 10 questions and verify count in database', async () => {
      // Генерация данных для создания
      const createQuestionPayload = (index: number) => ({
        body: `Question ${index}`,
        correctAnswers: ['correct answer'],
        // Другие необходимые поля
      });

      // Создание 10 вопросов
      for (let i = 0; i < 10; i++) {
        await server
          .post('/sa/quiz/questions/')
          .auth('admin', 'qwerty')
          .send(createQuestionPayload(i))
          .expect(HttpStatus.CREATED);
      }
      const questionRepository = app.get(getRepositoryToken(Question));
      const count = await questionRepository.count();
      await questionRepository
        .createQueryBuilder()
        .update(Question)
        .set({ published: true })
        .execute();
      console.log(`Total questions in the database: ${count}`);
    });

    it('Connect User1 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshToken1}`)
        .expect(HttpStatus.OK);
    });

    it('Connect User2 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshToken2}`)
        .expect(HttpStatus.OK);
    });

    it('Try to respond with one user 6 times', async () => {
      const inputModel = { answer: 'correct answer' };

      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 5; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshToken1}`)
          .send(inputModel)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
      // На 6-м запросе ожидаем ошибку 403
      const response = await server
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${refreshToken1}`)
        .send(inputModel)
        .expect(HttpStatus.FORBIDDEN); // Используем HttpStatus.FORBIDDEN, который обычно равен 403

      expect(response.body).toMatchObject({
        path: expect.any(String),
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
      });
    });
  });
});
