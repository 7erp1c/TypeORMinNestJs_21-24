import { UsersService } from '../../src/features/users/application/users.service';
import { DateCreate } from '../../src/base/adapters/get-current-date';
import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';
import { UsersRepositorySql } from '../../src/features/users/sql.infrastructure/user.repository.sql';

export class UserServiceMock extends UsersService {
  constructor(
    usersRepository: UsersRepository,
    dateCreate: DateCreate,
    usersRepositorySql: UsersRepositorySql,
  ) {
    super(usersRepository, usersRepositorySql, dateCreate);
  }
  sendEmail() {
    // Здесь можно добавить логику мокирования, если нужно
    return Promise.resolve(true);
  }
}
