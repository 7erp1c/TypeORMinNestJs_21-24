import {
  updateQuestion,
  updateQuestionPublish,
} from '../api/model/input/input.questions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../infrastructure.sql/questions.repository';

export class UpdateDataQuestionUseCaseCommand {
  constructor(
    public id: string,
    public inputModel: updateQuestion,
  ) {}
}
@CommandHandler(UpdateDataQuestionUseCaseCommand)
export class UpdateDataQuestionUseCase
  implements ICommandHandler<UpdateDataQuestionUseCaseCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}
  async execute(command: UpdateDataQuestionUseCaseCommand) {
    return await this.questionRepo.updateDataQuestion(
      command.id,
      command.inputModel,
    );
  }
}
