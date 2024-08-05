import { UserCreateInputModel } from '../api/models/input/create.user.input.model';
import { UserType } from '../api/models/output/output';
//import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter';
import { DateCreate } from '../../../base/adapters/get-current-date';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryTypeOrm } from '../infrastructure.TypeORM/users.repository.type.orm';

export class CreateUserUseCaseCommand {
  login: string;
  password: string;
  email: string;
  constructor(public inputModel: UserCreateInputModel) {
    this.login = inputModel.login;
    this.password = inputModel.password;
    this.email = inputModel.email;
  }
}
@CommandHandler(CreateUserUseCaseCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserUseCaseCommand>
{
  constructor(
    //private readonly usersRepository: UsersRepository, // mongoose
    //private readonly usersRepositorySql: UsersRepositorySql,//sql
    private readonly usersRepository: UsersRepositoryTypeOrm,
    private readonly bcryptAdapter: BcryptAdapter,
    protected dateCreate: DateCreate,
  ) {}
  async execute(command: CreateUserUseCaseCommand): Promise<string> {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const hash = await this.bcryptAdapter.createHash(
      command.inputModel.password,
    );

    const newUser: UserType = {
      login: command.login,
      email: command.email,
      hash: hash,
      createdAt: createdAt,
    };
    console.log('newUser:', newUser.login);
    //return await this.usersRepository.createUser(newUser); //mongoose
    //const userId = await this.usersRepositorySql.createUser(newUser);//sql
    const userId = await this.usersRepository.createUser(newUser);
    console.log(userId);
    return userId;
  }
}
