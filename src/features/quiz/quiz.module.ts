import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions/api/questions.controller';
import { QuestionsRepository } from './questions/infrastructure.sql/questions.repository';
import { CreateQuestionsUseCase } from './questions/aplication.use.case/create.question.use.case';
import { Question } from './questions/domain/quiz.question.entity';
import { DateCreate } from '../../base/adapters/get-current-date';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from './questions/infrastructure.sql/query/questions.query.repository';
import { DeleteQuestionUseCase } from './questions/aplication.use.case/delete.question.use.case';
import { UpdatePublishQuestionUseCase } from './questions/aplication.use.case/update.question.publish.use.case';
import { UpdateDataQuestionUseCase } from './questions/aplication.use.case/update.question.data.use.case';
import { Player } from './game/domain/player.entity';
import { Game } from './game/domain/game.entity';
import { Answer } from './game/domain/answers.on.questions.entity';
import { ConnectQuizGameUseCase } from './game/aplication.use.case/connect.quiz.game.use.case';

const questionsProvider = [
  CreateQuestionsUseCase,
  QuestionsRepository,
  QuestionsQueryRepository,
  DeleteQuestionUseCase,
  UpdatePublishQuestionUseCase,
  UpdateDataQuestionUseCase,
];
const quizUseCaseProvider = [ConnectQuizGameUseCase];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Question, Player, Game, Answer]),
  ],
  controllers: [QuestionsController],
  providers: [...questionsProvider, DateCreate, ...quizUseCaseProvider],
  exports: [],
})
export class QuizModule {}
