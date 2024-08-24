import { Injectable } from '@nestjs/common';
import { GameFinishedEvent } from '../event/game.finished';
import { OnEvent } from '@nestjs/event-emitter';
import { GameRepository } from '../../infrastructure.sql/game.repository';

@Injectable()
export class GameFinishedListener {
  constructor(private readonly gameRepository: GameRepository) {}

  //yarn add @nestjs/event-emitter
  @OnEvent('game.finished')
  handleGameFinished(event: GameFinishedEvent) {
    const { gameId, expDate } = event;

    setTimeout(async () => {
      await this.gameRepository.finishGame(gameId, expDate!);
    }, 10000);
  }
}
