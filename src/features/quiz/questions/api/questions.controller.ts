import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAuthGuard } from '../../../../common/guards/auth.admin.guard';
import { createQuestion } from './model/input/input.questions';
import { quizQuestion } from './model/type.question';
import { CreateQuestionUseCaseCommand } from '../aplication.use.case/create.question.use.case';
import { QuestionsQueryRepository } from '../infrastructure.sql/query/questions.query.repository';

@ApiTags('Questions')
@Controller('sa/quiz/')
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryRepository: QuestionsQueryRepository,
  ) {}

  @Post('questions')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createQuestions(
    @Body() inputModel: createQuestion,
  ): Promise<quizQuestion> {
    const createdQuestions = await this.commandBus.execute(
      new CreateQuestionUseCaseCommand(inputModel),
    );
    return await this.queryRepository.getById(createdQuestions);
  }
}
