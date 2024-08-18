import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../infrastructure.sql/questions.repository';
import { UsersRepositorySql } from '../../../users/sql.infrastructure/user.repository.sql';
import { UsersRepositoryTypeOrm } from '../../../users/infrastructure.TypeORM/users.repository.type.orm';

export class DeleteQuestionsUseCaseCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteQuestionsUseCaseCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionsUseCaseCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}
  async execute(command: DeleteQuestionsUseCaseCommand) {
    return await this.questionRepo.deleteQuestion(command.id);
  }
}
