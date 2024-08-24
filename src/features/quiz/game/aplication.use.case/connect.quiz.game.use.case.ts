import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../../../users/sql.infrastructure/users-query-repository-sql';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';
import { Player } from '../domain/player.entity';
import { Game } from '../domain/game.entity';
import { GameStatuses } from '../../enums/game.statuses';
import { QuestionsQueryRepository } from '../../questions/infrastructure.sql/query/questions.query.repository';
import { TransactionsRepository } from '../infrastructure.sql/transactionsRepository';
import {
  ExceptionResultType,
  ResultCode,
} from '../../../../common/exception-filters/exception.handler';
import { TransactionBaseUseCase } from '../../../../base/usecases/transaction-base.usecase';
import { DataSource, EntityManager } from 'typeorm';

export class ConnectQuizGameUseCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(ConnectQuizGameUseCaseCommand)
export class ConnectQuizGameUseCase extends TransactionBaseUseCase<
  ConnectQuizGameUseCaseCommand,
  ExceptionResultType<boolean>
> {
  constructor(
    protected readonly dataSource: DataSource,
    private readonly userQueryRepository: UsersQueryRepositorySql,
    private readonly gameQueryRepository: GameQueryRepository,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    super(dataSource);
  }

  async doLogic(
    command: ConnectQuizGameUseCaseCommand,
    manager: EntityManager,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.userQueryRepository.getById(
      command.userId,
      manager,
    );
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
      manager,
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
        await this.questionsQueryRepository.findRandomQuestions(manager);
    }
    console.log('gameCase3', game);
    await this.transactionsRepository.save(player, manager);
    await this.transactionsRepository.save(game, manager);

    return {
      data: true,
      code: ResultCode.Success,
      response: game!.id,
    };
  }
}
