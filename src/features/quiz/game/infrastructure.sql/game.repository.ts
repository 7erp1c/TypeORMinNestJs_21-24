import { GameStatuses } from '../../enums/game.statuses';
import { Repository } from 'typeorm';
import { Game } from '../domain/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async finishGame(gameId: string, finishGameDate: Date): Promise<boolean> {
    const result = await this.gameRepository.update(gameId, {
      finishGameDate: finishGameDate,
      status: GameStatuses.FINISHED,
    });

    return result.affected === 1;
  }
}
