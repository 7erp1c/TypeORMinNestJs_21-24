import { NewPasswordInputModel } from '../../security/auth/api/model/input/loginOrEmailInputModel';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter';
import { DateCreate } from '../../../base/adapters/get-current-date';
import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';
export class UpdatePasswordUseCaseCommand {
  constructor(public inputModelDto: NewPasswordInputModel) {}
}
@CommandHandler(UpdatePasswordUseCaseCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordUseCaseCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersRepositorySql: UsersRepositorySql,
    private readonly bcryptAdapter: BcryptAdapter,
    protected dateCreate: DateCreate,
  ) {}

  async execute(command: UpdatePasswordUseCaseCommand) {
    const createdAtPlus = await this.dateCreate.getDateInISOStringFormat();
    const hash = await this.bcryptAdapter.createHash(
      command.inputModelDto.password,
    );
    return await this.usersRepository.updatePassword(
      command.inputModelDto.code,
      hash,
      createdAtPlus,
    );
  }
}
