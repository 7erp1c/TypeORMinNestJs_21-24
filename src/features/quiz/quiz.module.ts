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

const questionsProvider = [
  CreateQuestionsUseCase,
  QuestionsRepository,
  QuestionsQueryRepository,
  DeleteQuestionUseCase,
  UpdatePublishQuestionUseCase,
  UpdateDataQuestionUseCase,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [QuestionsController],
  providers: [...questionsProvider, DateCreate],
  exports: [],
})
export class QuizModule {}
