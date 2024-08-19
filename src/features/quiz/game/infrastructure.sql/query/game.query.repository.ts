import { Game } from '../../domain/game.entity';
import { GameStatuses } from '../../../enums/game.statuses';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class GameQueryRepository {
  constructor(
    @InjectRepository(Game) private readonly users: Repository<Game>,
  ) {}
  async findGameForConnection(userId: string): Promise<Game | null> {
    try {
      return this.users
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.playerOne', 'po')
        .leftJoinAndSelect('game.playerTwo', 'pt')
        .leftJoinAndSelect('po.user', 'pou')
        .leftJoinAndSelect('pt.user', 'ptu')
        .where(`game.status = :pending or game.status = :active`, {
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
}
