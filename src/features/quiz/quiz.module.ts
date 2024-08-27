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
import { PairQuizController } from './game/api/pair.quiz.controller';
import { JwtService } from '@nestjs/jwt';
import { GameQueryRepository } from './game/infrastructure.sql/query/game.query.repository';
import { UsersQueryRepositorySql } from '../users/sql.infrastructure/users-query-repository-sql';
import { TransactionsRepository } from './game/infrastructure.sql/transactionsRepository';
import { SendAnswerUseCase } from './game/aplication.use.case/answers.quiz.game.use.case';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameQueryGetAllRepository } from './game/infrastructure.sql/query/game.query.get.all.repository';
import { MyStatisticQuery } from './game/infrastructure.sql/query/get.my.statistic.query.repository';

const questionsProvider = [
  CreateQuestionsUseCase,
  QuestionsRepository,
  QuestionsQueryRepository,
  DeleteQuestionUseCase,
  UpdatePublishQuestionUseCase,
  UpdateDataQuestionUseCase,
  UsersQueryRepositorySql,
  GameQueryGetAllRepository,
];
const quizUseCaseProvider = [
  ConnectQuizGameUseCase,
  QuestionsQueryRepository,
  GameQueryRepository,
  TransactionsRepository,
  SendAnswerUseCase,
  GameQueryRepository,
  MyStatisticQuery,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Question, Player, Game, Answer]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [QuestionsController, PairQuizController],
  providers: [
    ...questionsProvider,
    DateCreate,
    ...quizUseCaseProvider,
    JwtService,
  ],
  exports: [],
})
export class QuizModule {}
