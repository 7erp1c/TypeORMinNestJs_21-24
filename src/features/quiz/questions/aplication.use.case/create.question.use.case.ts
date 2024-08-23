import { createQuestion } from '../api/model/input/input.questions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateCreate } from '../../../../base/adapters/get-current-date';
import { createQuizQuestion } from '../api/model/type.question';
import { QuestionsRepository } from '../infrastructure.sql/questions.repository';

export class CreateQuestionUseCaseCommand {
  body: string;
  correctAnswer: string[];

  constructor(public inputModel: createQuestion) {
    this.body = inputModel.body;
    this.correctAnswer = inputModel.correctAnswers;
  }
}
@CommandHandler(CreateQuestionUseCaseCommand)
export class CreateQuestionsUseCase
  implements ICommandHandler<CreateQuestionUseCaseCommand>
{
  constructor(
    protected dateCreate: DateCreate,
    private readonly questionRepo: QuestionsRepository,
  ) {}
  async execute(command: CreateQuestionUseCaseCommand): Promise<string> {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const newQuestion: createQuizQuestion = {
      body: command.body,
      correctAnswers: command.correctAnswer,
      published: false,
      createdAt: createdAt,
      updatedAt: null,
    };
    const questionId = await this.questionRepo.createQuestion(newQuestion);
    return questionId;
  }
}
