import { Game } from '../../domain/game.entity';
import { GameStatuses } from '../../../enums/game.statuses';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Question } from '../../../questions/domain/quiz.question.entity';
import { Player } from '../../domain/player.entity';
import { Answer } from '../../domain/answers.on.questions.entity';
import { AnswerViewModel } from '../../api/model/output/output.connect/player.progress.view';

@Injectable()
export class GameQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly entityManager: EntityManager,
  ) {}
  async findGameForConnection(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    console.log('****', userId);
    try {
      return manager
        .createQueryBuilder(Game, 'g')
        .leftJoinAndSelect('g.playerOne', 'po')
        .leftJoinAndSelect('g.playerTwo', 'pt')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('pt.user', 'ptu')
        .where(`g.status = :pending or g.status = :active`, {
          pending: GameStatuses.PENDING_SECOND_PLAYER,
          active: GameStatuses.ACTIVE,
        })
        .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
          userId,
        })
        .getOne();
    } catch (e) {
      throw e;
    }
  }

  async getGameByProvidedId(
    gameId?: string,
    userId?: string,
    currentUserId?: string,
  ) {
    let game;
    console.log('******', gameId);
    // Получаем игру и связанные с ней данные
    if (gameId) {
      game = await this.gameRepository.findOne({
        where: { id: gameId },
        relations: [
          'playerOne',
          'playerTwo',
          'questions',
          'playerOne.answers',
          'playerTwo.answers',
          'playerOne.user',
          'playerTwo.user',
          'playerOne.answers.question', // Добавьте эту строку
          'playerTwo.answers.question', // Добавьте эту строку
        ],
      });
    } else if (userId) {
      // Поиск незавершенной(Active и PendingSecondPlayer) игры по userId
      console.log('****** Searching by userId:', userId);
      game = await this.gameRepository.findOne({
        where: [
          {
            playerOne: { user: { id: userId } },
            status: In(['PendingSecondPlayer', 'Active']),
          },
          {
            playerTwo: { user: { id: userId } },
            status: In(['PendingSecondPlayer', 'Active']),
          },
        ],
        relations: [
          'playerOne',
          'playerTwo',
          'questions',
          'playerOne.answers',
          'playerTwo.answers',
          'playerOne.user',
          'playerTwo.user',
          'playerOne.answers.question',
          'playerTwo.answers.question',
        ],
      });
    }
    if (gameId) {
      if (
        (!game.playerOne ||
          !game.playerOne.user ||
          game.playerOne.user.id !== currentUserId) &&
        (!game.playerTwo ||
          !game.playerTwo.user ||
          game.playerTwo.user.id !== currentUserId)
      ) {
        throw new ForbiddenException(
          'If current user is already participating in active pair',
        );
      }
    }

    if (!game) {
      throw new NotFoundException('Game not found');
    }
    console.log('******game', game);
    // Формируем ответ в нужном формате
    try {
      const response = {
        id: game.id,
        firstPlayerProgress: {
          answers: (game.playerOne?.answers || [])
            .sort(
              (a, b) =>
                new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
            ) // Сортировка по дате добавления
            .map((answer) => {
              console.log('Processing Answer:', answer);
              console.log('Answer Object:', answer);
              console.log('Question ID:', answer.question?.id);
              return {
                questionId: answer.question?.id || null,
                answerStatus: answer.answerStatus || null,
                addedAt: answer.addedAt || null,
              };
            }),
          player: {
            id: game.playerOne?.user?.id || null,
            login: game.playerOne?.user?.login || null,
          },
          score: game.playerOne?.score || 0,
        },
        secondPlayerProgress: game.playerTwo
          ? {
              answers: (game.playerTwo?.answers || [])
                .sort(
                  (a, b) =>
                    new Date(a.addedAt).getTime() -
                    new Date(b.addedAt).getTime(),
                ) // Сортировка по дате добавления
                .map((answer) => {
                  console.log('Processing Answer:', answer);
                  return {
                    questionId: answer.question?.id || null,
                    answerStatus: answer.answerStatus || null,
                    addedAt: answer.addedAt || null,
                  };
                }),
              player: {
                id: game.playerTwo?.user?.id || null,
                login: game.playerTwo?.user?.login || null,
              },
              score: game.playerTwo?.score || 0,
            }
          : null,

        questions:
          game.questions && game.questions.length
            ? game.questions
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                ) // Сортировка по дате создания
                .map((question) => {
                  console.log('Processing Question:', question);
                  return {
                    id: question.id || null,
                    body: question.body || null,
                  };
                })
            : null,

        status: game.status || null,
        pairCreatedDate: game.pairCreatedDate || null,
        startGameDate: game.startGameDate || null,
        finishGameDate: game.finishGameDate || null,
      };

      console.log('Mapped Response:', response);
      return response;
    } catch (error) {
      console.error('Error during mapping:', error);
    }
  }

  async findPlayerIdByUserId(
    userId: string,
    manager: EntityManager,
  ): Promise<string | null> {
    const result = await manager
      .createQueryBuilder(Player, 'p')
      .select('p.id')
      .where('p.userId = :userId', { userId })
      .getOne();

    if (result === null) {
      return null;
    }
    return result.id;
  }
  // .setLock('pessimistic_write', undefined, ['game']) //пессимистическая блокировак, пока не завершиться await, нельзя изменять
  async findGameForAnswer(
    userId: string,
    manager: EntityManager,
  ): Promise<Game | null> {
    return await manager
      .createQueryBuilder(Game, 'game')
      .setLock('pessimistic_write', undefined, ['game'])
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      //игра еще активна
      .where('game.status = :active', {
        active: GameStatuses.ACTIVE,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getOne();
  }
  //Общая логика:
  // Код находит игру и проверяет, участвует ли в ней пользователь.
  // Определяет, каким игроком (из двух) является пользователь.
  // Маппирует все ответы этого игрока в нужный формат.
  // Возвращает последний из этих ответов
  async findAnswerInGame(
    gameId: string,
    userId: string,
  ): Promise<AnswerViewModel | null> {
    const games = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where(`game.id = :gameId`, {
        gameId: gameId,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: userId,
      })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getMany();

    if (games.length === 0) {
      return null;
    }

    let answers = games[0].playerOne.answers;
    if (games[0].playerTwo.user.id === userId) {
      answers = games[0].playerTwo.answers;
    }

    const mappedAnswers = await this.answersMapping(answers);
    return mappedAnswers[mappedAnswers.length - 1];
  }

  // async findAnswerInGame(
  //   gameId: string,
  //   userId: string,
  // ): Promise<AnswerViewModel> {
  //   console.log('F', gameId);
  //   console.log('F', userId);
  //
  //   const game = await this.gameRepository
  //     .createQueryBuilder('game')
  //     .leftJoinAndSelect('game.questions', 'gq')
  //     .leftJoinAndSelect('game.playerOne', 'po')
  //     .leftJoinAndSelect('po.answers', 'poa')
  //     .leftJoinAndSelect('poa.question', 'poaq')
  //     .leftJoinAndSelect('game.playerTwo', 'pt')
  //     .leftJoinAndSelect('pt.answers', 'pta')
  //     .leftJoinAndSelect('pta.question', 'ptaq')
  //     .where('game.id = :gameId', { gameId })
  //     .andWhere('(po.user.id = :userId OR pt.user.id = :userId)', { userId })
  //     .orderBy('gq.createdAt', 'DESC')
  //     .addOrderBy('poa.addedAt')
  //     .addOrderBy('pta.addedAt')
  //     .getOne();
  //
  //   if (!game) {
  //     throw new ForbiddenException('Game not found.');
  //   }
  //   console.log('F', game);
  //
  //   const player =
  //     game.playerOne.id === userId ? game.playerOne : game.playerTwo;
  //
  //   if (!player || !player.answers || player.answers.length === 0) {
  //     throw new ForbiddenException('Player has not answered any questions.');
  //   }
  //
  //   const answers = player.answers;
  //   console.log('F', player);
  //
  //   // Маппинг ответов
  //   const mappedAnswers = answers.map((a) => ({
  //     questionId: a.question.id.toString(),
  //     answerStatus: a.answerStatus,
  //     addedAt: a.addedAt,
  //   }));
  //   console.log('F', mappedAnswers);
  //
  //   if (mappedAnswers.length === 0) {
  //     throw new ForbiddenException('No answers found for the player.');
  //   }
  //
  //   return mappedAnswers[mappedAnswers.length - 1]; // возвращаем последний ответ
  // }

  async activeGame(userId: string) {
    try {
      const findStatusGame = await this.gameRepository.findOne({
        where: [
          {
            playerOne: { user: { id: userId } },
            status: In(['PendingSecondPlayer', 'Active']),
          },
          {
            playerTwo: { user: { id: userId } },
            status: In(['PendingSecondPlayer', 'Active']),
          },
        ],
        relations: ['playerOne', 'playerTwo'],
      });
      if (findStatusGame) {
        throw new ForbiddenException('The user participates in the game');
      }
      return true;
    } catch (e) {
      throw e;
    }
  }

  async falseStart(userId: string): Promise<boolean> {
    try {
      // Находим игру, в которой пользователь участвует и которая имеет статус 'PendingSecondPlayer'
      const findStatusGame = await this.entityManager
        .createQueryBuilder(Game, 'game')
        .leftJoinAndSelect('game.playerOne', 'playerOne')
        .leftJoinAndSelect('game.playerTwo', 'playerTwo')
        .where('(playerOne.user.id = :userId OR playerTwo.user.id = :userId)', {
          userId,
        })
        .andWhere('game.status = :status', { status: 'PendingSecondPlayer' })
        .getOne();

      // Логируем результат запроса
      console.log('Find Status Game:', findStatusGame);

      // Если игра не найдена или статус не подходит
      if (findStatusGame) {
        throw new ForbiddenException(
          'The user cannot participate in this game',
        );
      }

      return true;
    } catch (e) {
      console.error('Error in falseStart:', e);
      throw e;
    }
  }

  async getAnswersCountInActiveGame(userId: string) {
    // Находим активную игру для игрока
    const activeGame = await this.entityManager
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.playerOne', 'playerOne')
      .leftJoinAndSelect('game.playerTwo', 'playerTwo')
      .where('playerOne.user.id = :userId OR playerTwo.user.id = :userId', {
        userId,
      })
      .andWhere('game.status = :status', { status: 'Active' }) // Замените 'ACTIVE' на фактическое значение статуса активной игры
      .getOne();
    console.log('activeGame ANSWER********* ', activeGame);
    // Если активная игра не найдена, возвращаем 0
    if (!activeGame) {
      throw new ForbiddenException({
        message: 'Game does not have status active game.',
      });
    }

    // Определяем игрока по userId
    const player =
      activeGame.playerOne.id === userId
        ? activeGame.playerOne
        : activeGame.playerTwo;
    console.log('PLAYER ANSWER********* ', player);
    // Если игрок не найден
    if (!player) {
      throw new ForbiddenException({
        message: 'Player does not have active game.',
      });
    }

    // Подсчитываем количество ответов игрока
    const count = this.entityManager
      .createQueryBuilder(Answer, 'answer')
      .leftJoin('answer.player', 'player')
      .where('player.id = :playerId', { playerId: player.id })
      .andWhere('answer.deletedAt IS NULL')
      .getCount();
    console.log('COUNT ANSWER********* ', count);
    if (+count >= 5) {
      throw new ForbiddenException(
        ' if current user has already answered to all questions',
      );
    }
  }

  private async answersMapping(array: Answer[]): Promise<AnswerViewModel[]> {
    return array.map((a) => {
      return {
        questionId: a.question.id.toString(),
        answerStatus: a.answerStatus,
        addedAt: a.addedAt,
      };
    });
  }

  async findGameById(gameId: string) {
    try {
      const game = await this.gameRepository.findOne({ where: { id: gameId } });

      if (game) {
        console.log('Game found:', game);
        return game; // Возвращаем найденную игру, если она существует
      } else {
        console.log('No game found with id:', gameId);
        return null; // Или выбросить исключение, если игра не найдена
      }
    } catch (error) {
      console.error('Error finding game:', error);
      throw error; // Пробрасываем ошибку, чтобы её можно было обработать выше
    }
  }
}
