import { ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../../../users/sql.infrastructure/users-query-repository-sql';
import { NotFoundException } from '@nestjs/common';
import { GameQueryRepository } from '../infrastructure.sql/query/game.query.repository';

export class ConnectQuizGameUseCaseCommand {
  constructor(public userId: string) {}
}
export class ConnectQuizGameUseCase
  implements ICommandHandler<ConnectQuizGameUseCaseCommand>
{
  constructor(
    private readonly userQueryRepository: UsersQueryRepositorySql,
    private readonly gameQueryRepository: GameQueryRepository,
  ) {}

  async execute(command: ConnectQuizGameUseCaseCommand) {
    const user = this.userQueryRepository.getById(command.userId);
    if (!user) {
      throw new NotFoundException(`User ${command.userId} does not exist`);
    }

    const game = await this.gameQueryRepository.findGameForConnection(
      command.userId,
    );
  }
}
