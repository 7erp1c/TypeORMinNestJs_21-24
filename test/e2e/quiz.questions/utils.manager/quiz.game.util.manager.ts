// GameQuizTests.js

import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

export class GameQuizTests {
  constructor(protected readonly app: INestApplication) {}
  async connectUser(userToken1, userToken2?) {
    const result = await request!(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${userToken1}`)
      .expect(HttpStatus.OK);

    if (userToken2) {
      await request!(this.app.getHttpServer())
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${userToken2}`)
        .expect(HttpStatus.OK);
    }
    return result.body.id;
  }

  async runTest(userToken, inputModel, repetitions) {
    const results: any[] = [];
    for (let i = 0; i < repetitions; i++) {
      console.log(`Test run ${i + 1} for userToken ${userToken}`);
      const result = await request!(this.app.getHttpServer())
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${userToken}`)
        .send(inputModel)
        .expect(HttpStatus.OK);
      results.push(result.body);
    }
    return results;
  }

  async getGame(token, gameId) {
    console.log("gameId", gameId);
    let score1: number | null = null;
    let score2: number | null = null;
    await request!(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        // Выводим нужное значение
        score1 = response.body.firstPlayerProgress.score;
        score2 = response.body.secondPlayerProgress.score;
        console.log("firstPlayerProgress.score: ", response.body.firstPlayerProgress.score);
        console.log("secondPlayerProgress.score: ", response.body.secondPlayerProgress.score);
      });

    return {
      score1: score1,
      score2: score2,
    };
  }

  // async connectAndRunTests(userToken, inputModel, repetitions) {
  //   await this.connectUser(userToken);
  //   await this.runTest(userToken, inputModel, repetitions);
  // }
}

// module.exports = GameQuizTests;
