export class AnswerDto {
  questionId: string;
  answerStatus: 'Correct' | 'Incorrect';
  addedAt: Date;
}

export class PlayerDto {
  id: string;
  login: string;
}

export class PlayerProgressDto {
  answers: AnswerDto[];
  player: PlayerDto;
  score: number;
}

export class QuestionDto {
  id: string;
  body: string;
}

export class GameResponseDto {
  id: string;
  firstPlayerProgress: PlayerProgressDto;
  secondPlayerProgress: PlayerProgressDto;
  questions: QuestionDto[];
  status: 'PendingSecondPlayer' | 'Active' | 'Completed';
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
