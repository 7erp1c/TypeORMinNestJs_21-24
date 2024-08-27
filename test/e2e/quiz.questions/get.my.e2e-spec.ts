import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { AuthTestManager } from '../../util/auth.test.manager';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from '../../../src/features/quiz/questions/domain/quiz.question.entity';
import {
  createModel1,
  createModel2,
  inputModelCorrect,
  loginModel1,
  loginModel2,
} from './input.for.test/input.for.quiz.questions';

describe('GET MY', () => {
  let server;
  let app: INestApplication;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    //создаём nest приложение
    app = moduleFixture.createNestApplication();

    // Применяем все настройки приложения (pipes, guards, filters, ...)
    applyAppSettings(app);
    //инициируем приложение
    await app.init();
    // Init authTestManager
    authTestManager = new AuthTestManager(app);
    server = request!(app.getHttpServer());
    await server.delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });
  let refreshTokenUser1: string;
  let refreshTokenUser2: string;
  // let refreshTokenUser3: string;
  // let refreshTokenUser4: string;

  describe('Create user,login, create 5 questions, connect game, 6 answer firsts user  ', () => {
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
      refreshTokenUser1 = responseLogin1.refreshToken;
      refreshTokenUser2 = responseLogin2.refreshToken;
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
        .set('Authorization', `Bearer ${refreshTokenUser1}`)
        .expect(HttpStatus.OK);
    });

    it('Connect User2 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshTokenUser2}`)
        .expect(HttpStatus.OK);
    });

    it('Reply 2 times by the User1', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser1}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply 3 times by the User2', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser2}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply 3 times by the User1', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 1; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser1}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply 2 times by the User2', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 1; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser2}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Connect_2 User1 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshTokenUser1}`)
        .expect(HttpStatus.OK);
    });

    it('Connect_2 User2 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshTokenUser2}`)
        .expect(HttpStatus.OK);
    });

    it('Reply_2 2 times by the User1', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser1}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply_2 3 times by the User2', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser2}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply_2 3 times by the User1', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 1; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser1}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply_2 2 times by the User2', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 1; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser2}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Connect_3 User1 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshTokenUser1}`)
        .expect(HttpStatus.OK);
    });

    it('Connect_3 User2 game', async () => {
      await server
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${refreshTokenUser2}`)
        .expect(HttpStatus.OK);
    });

    it('Reply_3 2 times by the User1', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser1}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    it('Reply_3 3 times by the User2', async () => {
      // Создаем и отправляем 6 запросов
      for (let i = 0; i < 4; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshTokenUser2}`)
          .send(inputModelCorrect)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });

    //
    //
    //
    //
    //
    //
    //
    //
    //
  });

  describe('GET MY', () => {
    console.log(refreshTokenUser1);
    console.log(refreshTokenUser1);
    it('Reply_2 User1 game', async () => {
      const result = await server
        .get('/pair-game-quiz/pairs/my?sortBy=status&sortDirection=desc')
        .set('Authorization', `Bearer ${refreshTokenUser2}`)
        .expect(HttpStatus.OK);
      console.log('GAME:', result.body);
      expect(result.body.items.length).toBe(3);
    });
  });
});
