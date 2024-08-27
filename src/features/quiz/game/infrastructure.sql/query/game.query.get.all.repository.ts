// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Game } from '../../domain/game.entity';
import { QuerySortType } from '../../../../../base/adapters/query/types';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class GameQueryGetAllRepository {
  constructor(private readonly manager: EntityManager) {}

  async getMyGameHistoryByUserId(userId: string, sortData: QuerySortType) {
    // Сортировка
    const sortDefault = {
      default: `"pairCreatedDate"`,
    };
    const sortKey = `"${sortData.sortBy}"` || `"${sortDefault.default}"`;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;
    console.log(sortKey);
    // Параметры пагинации 👀
    const pageNumber = +sortData.pageNumber || 1;
    const pageSize = +sortData.pageSize || 10;
    const offset = (pageNumber - 1) * pageSize;

    //Начало Query_Builderо4ка

    const query = await this.manager
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId })
      .orderBy(`game.${sortKey}`, sortDirection)
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .addOrderBy(`game.${sortDefault.default}`, 'DESC');

    console.log(query.getSql());
    // Выполнение запроса и получение результатов
    const [games, count] = await query.getManyAndCount();

    const paginatedGames =
      offset === 0 ? games : games.slice(offset, pageNumber * pageSize);

    console.log(
      'INDEX ///////// INDEX INDEX ///////// INDEX INDEX ///////// INDEX INDEX ///////// INDEX INDEX ///////// INDEX',
    );

    const mappedGames = paginatedGames.map((game) => ({
      id: game.id,
      firstPlayerProgress: {
        answers: game.playerOne.answers.map((answer) => ({
          questionId: answer.question.id,
          answerStatus: answer.answerStatus,
          addedAt: answer.addedAt.toISOString(),
        })),
        player: {
          id: game.playerOne.user.id,
          login: game.playerOne.user.login,
        },
        score: game.playerOne.score,
      },
      secondPlayerProgress: game.playerTwo
        ? {
            answers: game.playerTwo.answers.map((answer) => ({
              questionId: answer.question.id,
              answerStatus: answer.answerStatus,
              addedAt: answer.addedAt.toISOString(),
            })),
            player: {
              id: game.playerTwo.user.id,
              login: game.playerTwo.user.login,
            },
            score: game.playerTwo.score,
          }
        : null,
      questions: game.questions
        ? game.questions.map((question) => ({
            id: question.id,
            body: question.body,
          }))
        : null,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }));

    const response = {
      pagesCount: Math.ceil(count / +sortData.pageSize),
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: count,
      items: mappedGames,
    };

    // Возвращаем ответ
    return response;
  }
}
