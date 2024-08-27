import { GameStatuses } from '../../../../../enums/game.statuses';
import { AnswersStatuses } from '../../../../../enums/answers.statuses';
import { Question } from '../../../../../questions/domain/quiz.question.entity';
import { Player } from '../../../../domain/player.entity';
import { User } from '../../../../../../users/domain/user.entity';
import { Answer } from '../../../../domain/answers.on.questions.entity';

export interface GameWithRelations {
  questions: Question[];
  playerOne: Player & {
    user: User;
    answers: Answer[];
  };
  playerTwo: Player & {
    user: User;
    answers: Answer[];
  };
}
export type resulAllGamesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: gamesType;
};

export type gamesType = {
  id: string;
  firstPlayerProgress: {
    answers: {
      questionId: string;
      answerStatus: AnswersStatuses;
      addedAt: Date;
    }[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: {
      questionId: string;
      answerStatus: AnswersStatuses;
      addedAt: Date;
    }[];

    player: {
      id: string;
      login: string;
    };
    score: number;
  } | null;
  questions:
    | {
        id: string;
        body: string;
      }[]
    | null;
  status: GameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
};
