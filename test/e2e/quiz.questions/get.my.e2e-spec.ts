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
  createModel2, createModel3, createModel4,
  inputModelCorrect,
  inputModelIncorrect,
  loginModel1,
  loginModel2, loginModel3, loginModel4,
} from './input.for.test/input.for.quiz.questions';
import { GameQuizTests } from './utils.manager/quiz.game.util.manager';

describe('GET MY, GET STATISTICS', () => {
  let server;
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let gameQuizTests: GameQuizTests;

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
    gameQuizTests = new GameQuizTests(app);
    server = request!(app.getHttpServer());
    await server.delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });
  let refreshTokenUser1: string;
  let refreshTokenUser2: string;
  let refreshTokenUser3: string;
  let refreshTokenUser4: string;

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

      await authTestManager.createUser(createModel3);
      const responseLogin3 = await authTestManager.login(loginModel3);
      expect(responseLogin3).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      await authTestManager.createUser(createModel4);
      const responseLogin4 = await authTestManager.login(loginModel4);
      expect(responseLogin4).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
      refreshTokenUser1 = responseLogin1.refreshToken;
      refreshTokenUser2 = responseLogin2.refreshToken;
      refreshTokenUser3 = responseLogin3.refreshToken;
      refreshTokenUser4 = responseLogin4.refreshToken;
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




    it('Create four GAME (user 1 vs 2) 3:2 FIRST WIN', async () => {
      const numIterations = 2;

      for (let iteration = 1; iteration <= numIterations; iteration++) {
        console.log(`Running iteration ${iteration}`);
        const connect = await gameQuizTests.connectUser(refreshTokenUser1, refreshTokenUser2);

        const results = await gameQuizTests.runTest(
          refreshTokenUser1,
          inputModelCorrect,
          2,
        );
        expect(results.length).toBe(2);
        results.forEach((result) => {
          expect(result).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        const results2 = await gameQuizTests.runTest(
          refreshTokenUser2,
          inputModelCorrect,
          2,
        );
        expect(results2.length).toBe(2);
        results2.forEach((result2) => {
          expect(result2).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        await gameQuizTests.runTest(refreshTokenUser1, inputModelIncorrect, 3);
        await gameQuizTests.runTest(refreshTokenUser2, inputModelIncorrect, 3);
        const scoreResult = gameQuizTests.getGame(refreshTokenUser1, connect)
        expect((await scoreResult).score1).toBe(3);
        expect((await scoreResult).score2).toBe(2);
      }
    })

    it('Create four GAME (user 2 vs 1) 3:2 FIRST WIN', async () => {
      const numIterations = 2;

      for (let iteration = 1; iteration <= numIterations; iteration++) {
        console.log(`Running iteration ${iteration}`);
        const connect = await gameQuizTests.connectUser(refreshTokenUser2, refreshTokenUser1, );

        const results = await gameQuizTests.runTest(
          refreshTokenUser2,
          inputModelCorrect,
          2,
        );
        expect(results.length).toBe(2);
        results.forEach((result) => {
          expect(result).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        const results2 = await gameQuizTests.runTest(
          refreshTokenUser1,
          inputModelCorrect,
          2,
        );
        expect(results2.length).toBe(2);
        results2.forEach((result2) => {
          expect(result2).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        await gameQuizTests.runTest(refreshTokenUser2, inputModelIncorrect, 3);
        await gameQuizTests.runTest(refreshTokenUser1, inputModelIncorrect, 3);
        const scoreResult = gameQuizTests.getGame(refreshTokenUser1, connect)
        expect((await scoreResult).score1).toBe(3);
        expect((await scoreResult).score2).toBe(2);
      }
    })

    it('Create GAME (user 1 vs 3) 2:2 DRAW', async () => {
      const connect = await gameQuizTests.connectUser(refreshTokenUser1, refreshTokenUser3);

      const results = await gameQuizTests.runTest(
        refreshTokenUser1,
        inputModelCorrect,
        1,
      );
      expect(results.length).toBe(1);
      results.forEach((result) => {
        expect(result).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      const results2 = await gameQuizTests.runTest(
        refreshTokenUser3,
        inputModelCorrect,
        2,
      );
      expect(results2.length).toBe(2);
      results2.forEach((result2) => {
        expect(result2).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      await gameQuizTests.runTest(refreshTokenUser1, inputModelIncorrect, 4);
      await gameQuizTests.runTest(refreshTokenUser3, inputModelIncorrect, 3);
      const scoreResult =  gameQuizTests.getGame(refreshTokenUser1,connect)
      expect((await scoreResult).score1).toBe(2);
      expect((await scoreResult).score2).toBe(2);
    });




    it('Create TWO GAME (user 1 vs 4 )SECOND WIN 0:5', async () => {

        const connect = await gameQuizTests.connectUser(refreshTokenUser1, refreshTokenUser4);

        const results = await gameQuizTests.runTest(
          refreshTokenUser1,
          inputModelIncorrect,
          2,
        );
        expect(results.length).toBe(2);
        results.forEach((result) => {
          expect(result).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        const results2 = await gameQuizTests.runTest(
          refreshTokenUser4,
          inputModelCorrect,
          2,
        );
        expect(results2.length).toBe(2);
        results2.forEach((result2) => {
          expect(result2).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        });
        await gameQuizTests.runTest(refreshTokenUser1, inputModelIncorrect, 3);
        await gameQuizTests.runTest(refreshTokenUser4, inputModelCorrect, 3);
        const scoreResult = gameQuizTests.getGame(refreshTokenUser1, connect)
        expect((await scoreResult).score1).toBe(0);
        expect((await scoreResult).score2).toBe(5);

    });

    it('Create TWO GAME (user 4 vs 1) SECOND WIN 0:5', async () => {
      const connect = await gameQuizTests.connectUser(refreshTokenUser4, refreshTokenUser1);

      const results = await gameQuizTests.runTest(
        refreshTokenUser4,
        inputModelIncorrect,
        2,
      );
      expect(results.length).toBe(2);
      results.forEach((result) => {
        expect(result).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      const results2 = await gameQuizTests.runTest(
        refreshTokenUser1,
        inputModelCorrect,
        2,
      );
      expect(results2.length).toBe(2);
      results2.forEach((result2) => {
        expect(result2).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      await gameQuizTests.runTest(refreshTokenUser4, inputModelIncorrect, 3);
      await gameQuizTests.runTest(refreshTokenUser1, inputModelCorrect, 3);
      const scoreResult = gameQuizTests.getGame(refreshTokenUser1, connect)
      expect((await scoreResult).score1).toBe(0);
      expect((await scoreResult).score2).toBe(5);

    });


    it('Create GAME (user 2 vs 4) 3:2', async () => {
      const connect = await gameQuizTests.connectUser(refreshTokenUser2, refreshTokenUser4);

      const results = await gameQuizTests.runTest(
        refreshTokenUser2,
        inputModelCorrect,
        2,
      );
      expect(results.length).toBe(2);
      results.forEach((result) => {
        expect(result).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      const results2 = await gameQuizTests.runTest(
        refreshTokenUser4,
        inputModelCorrect,
        2,
      );
      expect(results2.length).toBe(2);
      results2.forEach((result2) => {
        expect(result2).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      });
      await gameQuizTests.runTest(refreshTokenUser2, inputModelIncorrect, 3);
      await gameQuizTests.runTest(refreshTokenUser4, inputModelIncorrect, 3);
      const scoreResult =  gameQuizTests.getGame(refreshTokenUser2,connect)
      expect((await scoreResult).score1).toBe(3);
      expect((await scoreResult).score2).toBe(2);
    });

    // it('Reply 2 times by the User1', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 3; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
//
    // it('Reply 3 times by the User2', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 2; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
//
    // it('Reply 3 times by the User1', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 2; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //       .send(inputModelIncorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Reply 2 times by the User2', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 3; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //       .send(inputModelIncorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
//
    // it('Connect_2 User1 game', async () => {
    //   await server
    //     .post('/pair-game-quiz/pairs/connection')
    //     .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //     .expect(HttpStatus.OK);
    // });
    //
    // it('Connect_2 User2 game', async () => {
    //   await server
    //     .post('/pair-game-quiz/pairs/connection')
    //     .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //     .expect(HttpStatus.OK);
    // });
    //
    // it('Reply_2 2 times by the User1', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 3; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Reply_2 3 times by the User2', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 2; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Reply_2 3 times by the User1', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 2; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //       .send(inputModelIncorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Reply_2 2 times by the User2', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 3; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //       .send(inputModelIncorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Connect_3 User1 game', async () => {
    //   await server
    //     .post('/pair-game-quiz/pairs/connection')
    //     .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //     .expect(HttpStatus.OK);
    // });
    //
    // it('Connect_3 User2 game', async () => {
    //   await server
    //     .post('/pair-game-quiz/pairs/connection')
    //     .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //     .expect(HttpStatus.OK);
    // });
    //
    // it('Reply_3 2 times by the User1', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 4; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser1}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
    //
    // it('Reply_3 3 times by the User2', async () => {
    //   // Создаем и отправляем 6 запросов
    //   for (let i = 0; i < 4; i++) {
    //     console.log('INDEX: ', i);
    //     const response = await server
    //       .post('/pair-game-quiz/pairs/my-current/answers')
    //       .set('Authorization', `Bearer ${refreshTokenUser2}`)
    //       .send(inputModelCorrect)
    //       .expect(HttpStatus.OK);
    //
    //     expect(response.body).toMatchObject({
    //       addedAt: expect.any(String),
    //       answerStatus: expect.any(String),
    //       questionId: expect.any(String),
    //     });
    //   }
    // });
//
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
      expect(result.body.items.length).toBe(5);
    });
  });

  describe('GET STATIC', () => {
    console.log(refreshTokenUser1);
    console.log(refreshTokenUser1);
    it('Reply_2 User1 game', async () => {
      const result = await server
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${refreshTokenUser1}`)
        .expect(HttpStatus.OK);
      console.log('GAME:', result.body);

      // Ожидаемые значения
      const expectedResponse = {
        sumScore: 17,
        avgScores: 2.43,
        gamesCount: 7,
        winsCount: 3,
        lossesCount: 3,
        drawsCount: 1
      };

      // Проверка значений
      expect(result.body.sumScore).toBe(expectedResponse.sumScore);
      expect(result.body.avgScores).toBeCloseTo(expectedResponse.avgScores, 2); // Проверяем с точностью до 2-х знаков после запятой
      expect(result.body.gamesCount).toBe(expectedResponse.gamesCount);
      expect(result.body.winsCount).toBe(expectedResponse.winsCount);
      expect(result.body.lossesCount).toBe(expectedResponse.lossesCount);
      expect(result.body.drawsCount).toBe(expectedResponse.drawsCount);
   //WINNNNNNNNN!!NN!!N!N!N!N!N!N
    });
  });
});
