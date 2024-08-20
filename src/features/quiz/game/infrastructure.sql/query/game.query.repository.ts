import { Game } from '../../domain/game.entity';
import { GameStatuses } from '../../../enums/game.statuses';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
  ) {}
  async findGameForConnection(userId: string): Promise<Game | null> {
    console.log('****', userId);
    try {
      return this.gameRepository
        .createQueryBuilder('g')
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

  async getGameByProvidedId(gameId?: string, userId?: string) {
    try {
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
          ],
        });
      }

      if (!game) {
        throw new NotFoundException('Game not found');
      }
      console.log('******game', game);
      // Формируем ответ в нужном формате
      const response = {
        id: game.id,
        firstPlayerProgress: {
          answers: game.playerOne.answers.map((answer) => ({
            questionId: answer.question.id,
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt,
          })),
          player: {
            id: game.playerOne.user.id,
            login: game.playerOne.user.login,
          },
          score: game.playerOne.score,
        },
        secondPlayerProgress: {
          answers:
            game.playerTwo?.answers.map((answer) => ({
              questionId: answer.question.id,
              answerStatus: answer.answerStatus,
              addedAt: answer.addedAt,
            })) || [],
          player: {
            id: game.playerTwo?.user.id,
            login: game.playerTwo?.user.login,
          },
          score: game.playerTwo?.score || 0,
        },
        questions: game.questions.map((question) => ({
          id: question.id,
          body: question.body,
        })),
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };

      return response;
    } catch (e) {
      console.error('Error fetching game:', e);
      throw e;
    }
  }

  async findPlayerIdByUserId(userId: string): Promise<string | null> {
    const result = await this.playerRepository
      .createQueryBuilder('p')
      .select('p.id')
      .where('p.userId = :userId', { userId })
      .getOne();

    if (result === null) {
      return null;
    }
    return result.id;
  }

  async findGameForAnswer(userId: number): Promise<Game | null> {
    return await this.gameRepository
      .createQueryBuilder('game')
      .setLock('pessimistic_write', undefined, ['game']) //пессимистическая блокировак, пока не завершиться await, нельзя изменять
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
  ): Promise<AnswerViewModel> {
    const game = await this.gameRepository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where('game.id = :gameId', { gameId })
      .andWhere('(po.user.id = :userId OR pt.user.id = :userId)', { userId })
      .orderBy('gq.createdAt', 'DESC')
      .addOrderBy('poa.addedAt')
      .addOrderBy('pta.addedAt')
      .getOne();

    if (!game) {
      throw new ForbiddenException('Game dont have an answer.');
    }

    const player =
      game.playerOne.user.id === userId ? game.playerOne : game.playerTwo;
    const answers = player.answers;

    // Маппинг ответов
    const mappedAnswers = answers.map((a) => ({
      questionId: a.question.id.toString(),
      answerStatus: a.answerStatus,
      addedAt: a.addedAt,
    }));

    return mappedAnswers[mappedAnswers.length - 1]; //возвращаем последний
  }
}
