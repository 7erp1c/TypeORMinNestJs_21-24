import { LoginOrEmailInputModel } from '../api/model/input/loginOrEmailInputModel';
import { SessionInputModel } from '../../devices/api/model/input/session.input.models';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { BcryptAdapter } from '../../../../base/adapters/bcrypt.adapter';
import { DevicesService } from '../../devices/aplication/devices.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LoginUserUseCaseCommand {
  constructor(
    public inputModelDto: LoginOrEmailInputModel,
    public sessionInputModel: SessionInputModel,
  ) {}
}
@CommandHandler(LoginUserUseCaseCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserUseCaseCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly devicesService: DevicesService,
  ) {}

  async execute(command: LoginUserUseCaseCommand) {
    //ищем User по логину или email (res ошибка внутри)
    const user = await this.usersService.getUserByLoginOrEmail(
      command.inputModelDto,
    );
    if (!user)
      throw new HttpException('Bad login or password', HttpStatus.UNAUTHORIZED);
    // const userId = user._id.toString(); //mongoose
    const userId = user.id.toString();
    const userName = user.login;
    //сравним input-пароль c паролем в Db
    const compareHash = await this.bcryptAdapter.compareHash(
      command.inputModelDto.password,
      user.hash,
    );
    if (!compareHash)
      throw new UnauthorizedException(
        `status: ${HttpStatus.UNAUTHORIZED}, Method: logInUser, field: findUser, enter a different password`,
      );
    return await this.devicesService.createSession(
      command.sessionInputModel,
      userId,
      userName,
    );
  }
}
