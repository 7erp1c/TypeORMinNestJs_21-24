import { GameStatuses } from '../../../../../enums/game.statuses';
import { PlayerProgressViewModel } from './player.progress.view';
import { QuestionViewModel } from './questions.view';

export class ConnectionViewModel {
  id: string;

  firstPlayerProgress: PlayerProgressViewModel;

  secondPlayerProgress: PlayerProgressViewModel;

  questions: QuestionViewModel[] | null;

  status: GameStatuses;

  pairCreatedDate: Date;

  startGameDate: Date | null;

  finishGameDate: Date | null;
}
