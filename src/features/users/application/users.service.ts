import { Injectable } from '@nestjs/common';
// import { UsersRepository } from '../infrastructure/users.repository';
import { DateCreate } from '../../../base/adapters/get-current-date';
import {
  ConfirmationCodeInputModel,
  LoginOrEmailInputModel,
  UserEmailInputModel,
} from '../../security/auth/api/model/input/loginOrEmailInputModel';
import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';
//import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(
    //private readonly usersRepository: UsersRepository,
    private readonly usersRepositorySql: UsersRepositorySql,
    protected dateCreate: DateCreate,
  ) {}
  async getUserByLoginOrEmail(inputModelDto: LoginOrEmailInputModel) {
    //return await this.usersRepository.getUserByLoginOrEmail(inputModelDto); //mongoose
    return await this.usersRepositorySql.getUserByLoginOrEmail(inputModelDto);
  }

  async getUserByCode(code: string) {
    //return await this.usersRepository.getUserByCode(code);//mongoose
    return await this.usersRepositorySql.getUserByCode(code);
  }

  // async updateRecovery(email: string, code: string) {
  //   const createdAtPlus = await this.dateCreate.getDateInISOStringFormat();
  //   return await this.usersRepository.updateRecovery(
  //     email,
  //     code,
  //     createdAtPlus,
  //   );
  // }
  async updateConfirmationStatus(inputModelDto: ConfirmationCodeInputModel) {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    //return await this.usersRepository.updateConfirmationStatus( //mongoose
    return await this.usersRepositorySql.updateConfirmationStatus(
      inputModelDto.code,
      createdAt,
    );
  }
  async updateUserConfirmationCodeAndData(
    inputModelDto: UserEmailInputModel,
    RecoveryCode: string,
  ) {
    const createdAtPlus = await this.dateCreate.getDateInISOStringFormat();
    // return await this.usersRepository.updateUserConfirmationAccount( //mongoose
    return await this.usersRepositorySql.updateUserConfirmationAccount(
      inputModelDto.email,
      RecoveryCode,
      createdAtPlus,
    );
  }

  async getUserById(userId: string) {
    //return await this.usersRepository.getUserById(userId);
    return await this.usersRepositorySql.getUserById(userId);
  }
  async getUserByEmail(email: string) {
    //return await this.usersRepository.getUserByEmail(email); //mongoose
    return await this.usersRepositorySql.getUserByEmail(email);
  }
}
