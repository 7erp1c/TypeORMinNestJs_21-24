import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { AuthTestManager } from '../../util/auth.test.manager';
import { UserCreateInputModel } from '../../../src/features/users/api/models/input/create.user.input.model';
import { LoginOrEmailInputModel } from '../../../src/features/security/auth/api/model/input/loginOrEmailInputModel';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from '../../../src/features/quiz/questions/domain/quiz.question.entity';
import { Game } from '../../../src/features/quiz/game/domain/game.entity';

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

const inputModelCorrect = { answer: 'correct answer' };
const inputModelIncorrect = { answer: 'incorrect' };

describe('quiz', () => {
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

    it('Reply 2 times by the User1', async () => {
      const inputModel = { answer: 'correct answer' };

      for (let i = 0; i < 3; i++) {
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
    });
    it('Get my current player1', async () => {
      // Сохраняем оригинальный console.log
      const originalConsoleLog = console.log;
      // Переопределяем console.log, чтобы подавить все выводы
      console.log = () => {};
      try {
        await server
          .get('/pair-game-quiz/pairs/my-current')
          .set('Authorization', `Bearer ${refreshToken1}`)
          .expect(HttpStatus.OK)
          .then((response) => {
            // Выводим нужное значение
            console.log(response.body.firstPlayerProgress.score);
          });
      } finally {
        // Восстанавливаем оригинальный console.log после выполнения теста
        console.log = originalConsoleLog;
      }
    });

    it('Reply 3 times by the User2', async () => {
      const inputModel = { answer: 'correct answer' };

      for (let i = 0; i < 3; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshToken2}`)
          .send(inputModel)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });
    it('Get my current player2', async () => {
      await server
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${refreshToken2}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          console.log(response.body.secondPlayerProgress);
          console.log(response.body.secondPlayerProgress.answers);
        });
    });

    it('Reply 3 times by the User1', async () => {
      const inputModel = { answer: 'correct answer' };

      for (let i = 0; i < 2; i++) {
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
    });

    it('Reply 2 times by the User2', async () => {
      const inputModel = { answer: 'correct answer' };

      for (let i = 0; i < 2; i++) {
        console.log('INDEX: ', i);
        const response = await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshToken2}`)
          .send(inputModel)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          addedAt: expect.any(String),
          answerStatus: expect.any(String),
          questionId: expect.any(String),
        });
      }
    });
    it('Not should Get my current player2', async () => {
      await server
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', `Bearer ${refreshToken1}`)
        .expect(HttpStatus.NOT_FOUND)
        .then((response) => {
          console.log(response.body);
        });
    });
    it('Should return forbidden since player 5 is responsible', async () => {
      const inputModel = { answer: 'correct answer' };

      for (let i = 0; i < 1; i++) {
        console.log('INDEX: ', i);
        await server
          .post('/pair-game-quiz/pairs/my-current/answers')
          .set('Authorization', `Bearer ${refreshToken2}`)
          .send(inputModel)
          .expect(HttpStatus.FORBIDDEN);
      }
    });
    //CHECK SCORE////////////////////////////CHECK SCORE
    //CHECK SCORE/////////////////////////CHECK SCORE
    //CHECK SCORE//////////////////////////////CHECK SCORE
    describe('Check score  ', () => {
      let refreshToken1: string;
      let refreshToken2: string;
      let gameId: string;

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
          .expect(HttpStatus.OK)
          .then((response) => {
            gameId = response.body.id;
            console.log(`GAMEID ${gameId}`);
          });
      });

      it('Answer 4 User1', async () => {
        for (let i = 0; i < 4; i++) {
          console.log('INDEX: ', i);
          const response = await server
            .post('/pair-game-quiz/pairs/my-current/answers')
            .set('Authorization', `Bearer ${refreshToken1}`)
            .send(inputModelIncorrect)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        }
      });
      it('Get score_1 player_1', async () => {
        // Сохраняем оригинальный console.log
        const originalConsoleLog = console.log;
        // Функция для логирования только нужного сообщения
        const logOnlyScore = (message) => {
          if (typeof message === 'number') {
            originalConsoleLog(message);
          }
        };
        // Переопределяем console.log, чтобы использовать logOnlyScore
        console.log = logOnlyScore;
        try {
          await server
            .get('/pair-game-quiz/pairs/my-current')
            .set('Authorization', `Bearer ${refreshToken1}`)
            .expect(HttpStatus.OK)
            .then((response) => {
              // Выводим нужное значение
              console.log(response.body.firstPlayerProgress.score);
              console.log(response.body);
            });
        } finally {
          // Восстанавливаем оригинальный console.log после выполнения теста
          console.log = originalConsoleLog;
        }
      });

      it('Answer 4 User2', async () => {
        for (let i = 0; i < 4; i++) {
          console.log('INDEX: ', i);
          const response = await server
            .post('/pair-game-quiz/pairs/my-current/answers')
            .set('Authorization', `Bearer ${refreshToken2}`)
            .send(inputModelIncorrect)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        }
      });
      it('Get score_1 player_2', async () => {
        // Сохраняем оригинальный console.log
        const originalConsoleLog = console.log;
        // Функция для логирования только нужного сообщения
        const logOnlyScore = (message) => {
          if (typeof message === 'number') {
            originalConsoleLog(message);
          }
        };
        // Переопределяем console.log, чтобы использовать logOnlyScore
        console.log = logOnlyScore;
        try {
          await server
            .get('/pair-game-quiz/pairs/my-current')
            .set('Authorization', `Bearer ${refreshToken2}`)
            .expect(HttpStatus.OK)
            .then((response) => {
              // Выводим нужное значение
              console.log(response.body.secondPlayerProgress.score);
              console.log(response.body);
            });
        } finally {
          // Восстанавливаем оригинальный console.log после выполнения теста
          console.log = originalConsoleLog;
        }
      });

      it('Answer 1 User1', async () => {
        for (let i = 0; i < 1; i++) {
          console.log('INDEX: ', i);
          const response = await server
            .post('/pair-game-quiz/pairs/my-current/answers')
            .set('Authorization', `Bearer ${refreshToken1}`)
            .send(inputModelCorrect)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        }
      });
      it('Get my current_2 player_1', async () => {
        // Сохраняем оригинальный console.log
        const originalConsoleLog = console.log;
        // Функция для логирования только нужного сообщения
        const logOnlyScore = (message) => {
          if (typeof message === 'number') {
            originalConsoleLog(message);
          }
        };
        // Переопределяем console.log, чтобы использовать logOnlyScore
        console.log = logOnlyScore;
        try {
          await server
            .get('/pair-game-quiz/pairs/my-current')
            .set('Authorization', `Bearer ${refreshToken1}`)
            .expect(HttpStatus.OK)
            .then((response) => {
              // Выводим нужное значение
              console.log(response.body.firstPlayerProgress.score);
              console.log(response.body);
            });
        } finally {
          // Восстанавливаем оригинальный console.log после выполнения теста
          console.log = originalConsoleLog;
        }
      });

      it('Answer 1 User2', async () => {
        for (let i = 0; i < 1; i++) {
          console.log('INDEX: ', i);
          const response = await server
            .post('/pair-game-quiz/pairs/my-current/answers')
            .set('Authorization', `Bearer ${refreshToken2}`)
            .send(inputModelIncorrect)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            addedAt: expect.any(String),
            answerStatus: expect.any(String),
            questionId: expect.any(String),
          });
        }
      });
      it('Get game by id ', async () => {
        await server
          .get(`/pair-game-quiz/pairs/${gameId}`)
          .set('Authorization', `Bearer ${refreshToken2}`)
          .expect(HttpStatus.OK)
          .then((response) => {
            // Выводим нужное значение
            console.log(response.body.firstPlayerProgress.score);
          });
      });

      it('Get my current return 404 because status game => Finished', async () => {
        await server
          .get(`/pair-game-quiz/pairs/my-current`)
          .set('Authorization', `Bearer ${refreshToken1}`)
          .expect(HttpStatus.NOT_FOUND)
          .then((response) => {
            console.log(response.body);
          });
      });
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
});
