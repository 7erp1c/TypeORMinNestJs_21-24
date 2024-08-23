import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../../../users/sql.infrastructure/users-query-repository-sql';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';
import { Player } from '../domain/player.entity';
import { Game } from '../domain/game.entity';
import { GameStatuses } from '../../enums/game.statuses';
import { QuestionsQueryRepository } from '../../questions/infrastructure.sql/query/questions.query.repository';
import { SaveRepository } from '../infrastructure.sql/save.repository';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';

export class ConnectQuizGameUseCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(ConnectQuizGameUseCaseCommand)
export class ConnectQuizGameUseCase
  implements
    ICommandHandler<
      ConnectQuizGameUseCaseCommand,
      ExceptionResultType<boolean>
    >
{
  constructor(
    private readonly userQueryRepository: UsersQueryRepositorySql,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly saveRepository: SaveRepository,
  ) {}

  async execute(
    command: ConnectQuizGameUseCaseCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.userQueryRepository.getById(command.userId);
    console.log('UseCase', command.userId);
    console.log('UseCase', user);
    if (!user)
      return {
        data: false,
        code: ResultCode.NotFound,
        field: 'userId',
        message: 'User not found!',
      };

    let game = await this.gameQueryRepository.findGameForConnection(
      command.userId,
    );
    console.log('gameCase', game);

    const player = new Player();
    player.user = user;
    player.score = 0;
    console.log('player', player);
    if (!game) {
      game = new Game();
      game.playerOne = player;
      game.status = GameStatuses.PENDING_SECOND_PLAYER;
      game.pairCreatedDate = new Date();
    } else {
      if (
        game.status === GameStatuses.PENDING_SECOND_PLAYER &&
        game?.playerOne?.user?.id === command.userId
      )
        return {
          data: false,
          code: ResultCode.Forbidden,
        };
      console.log('gameCase2', game);
      game.playerTwo = player;
      game.status = GameStatuses.ACTIVE;
      game.startGameDate = new Date();
      game.questions =
        await this.questionsQueryRepository.findRandomQuestions();
    }
    console.log('gameCase3', game);
    await this.saveRepository.save(player);
    await this.saveRepository.save(game);

    return {
      data: true,
      code: ResultCode.Success,
      response: game!.id,
    };
  }
}
