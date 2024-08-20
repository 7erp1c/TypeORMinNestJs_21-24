import { AnswersStatuses } from '../../../../../enums/answers.statuses';

export class AnswerViewModel {
  questionId: string;

  answerStatus: AnswersStatuses;

  addedAt: Date;
}

export class PlayerViewModel {
  id: string;

  login: string;
}

export class PlayerProgressViewModel {
  answers: AnswerViewModel[];

  player: PlayerViewModel;

  score: number;
}
