import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions/api/questions.controller';
import { QuestionsRepository } from './questions/infrastructure.sql/questions.repository';
import { CreateQuestionsUseCase } from './questions/aplication.use.case/create.question.use.case';
import { Question } from './questions/domain/quiz.question.entity';
import { DateCreate } from '../../base/adapters/get-current-date';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from './questions/infrastructure.sql/query/questions.query.repository';

const questionsProvider = [
  CreateQuestionsUseCase,
  QuestionsRepository,
  QuestionsQueryRepository,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [QuestionsController],
  providers: [...questionsProvider, DateCreate],
  exports: [],
})
export class QuizModule {}
