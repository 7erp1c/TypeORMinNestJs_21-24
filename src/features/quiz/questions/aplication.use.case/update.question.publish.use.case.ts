import { updateQuestionPublish } from '../api/model/input/input.questions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../infrastructure.sql/questions.repository';

export class UpdatePublishQuestionUseCaseCommand {
  constructor(
    public id: string,
    public inputModel: updateQuestionPublish,
  ) {}
}
@CommandHandler(UpdatePublishQuestionUseCaseCommand)
export class UpdatePublishQuestionUseCase
  implements ICommandHandler<UpdatePublishQuestionUseCaseCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}
  async execute(command: UpdatePublishQuestionUseCaseCommand) {
    return await this.questionRepo.updatePublishQuestion(
      command.id,
      command.inputModel,
    );
  }
}
