import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAuthGuard } from '../../../../common/guards/auth.admin.guard';
import {
  createQuestion,
  updateQuestion,
  updateQuestionPublish,
} from './model/input/input.questions';
import { quizQuestion } from './model/type.question';
import { CreateQuestionUseCaseCommand } from '../aplication.use.case/create.question.use.case';
import { QuestionsQueryRepository } from '../infrastructure.sql/query/questions.query.repository';
import { DeleteQuestionsUseCaseCommand } from '../aplication.use.case/delete.question.use.case';
import { UpdatePublishQuestionUseCaseCommand } from '../aplication.use.case/update.question.publish.use.case';
import { UpdateDataQuestionUseCaseCommand } from '../aplication.use.case/update.question.data.use.case';
import { QueryRequestType } from '../../../../base/adapters/query/types';
import { createQuery } from '../../../../base/adapters/query/create.query';

@ApiTags('Questions')
@Controller('sa/quiz/')
export class QuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly queryRepository: QuestionsQueryRepository,
  ) {}

  @Get('questions')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findQuestions(@Query() query: QueryRequestType) {
    const { sortData, searchData } = createQuery(query);
    return await this.queryRepository.getAll(sortData, searchData);
  }

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

  @Delete('questions/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    const deleteQuestions = await this.commandBus.execute(
      new DeleteQuestionsUseCaseCommand(id),
    );
    return deleteQuestions;
  }

  @Put('questions/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionData(
    @Param('id') id: string,
    @Body() inputModel: updateQuestion,
  ) {
    const updateQuestion = await this.commandBus.execute(
      new UpdateDataQuestionUseCaseCommand(id, inputModel),
    );
    return updateQuestion;
  }

  @Put('questions/:id/publish')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionPublish(
    @Param('id') id: string,
    @Body() inputModel: updateQuestionPublish,
  ) {
    const updateQuestionPublish = await this.commandBus.execute(
      new UpdatePublishQuestionUseCaseCommand(id, inputModel),
    );
    return updateQuestionPublish;
  }
}
