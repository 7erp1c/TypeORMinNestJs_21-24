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
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UserCreateInputModel } from './models/input/create.user.input.model';
import { createQuery } from '../../../base/adapters/query/create.query';
import { QueryUsersRequestType } from './models/input/input';
import { AdminAuthGuard } from '../../../common/guards/auth.admin.guard';
import { CreateUserUseCaseCommand } from '../aplicaion.use.case/create.user.use.case';
import { DeleteUserUseCaseCommand } from '../aplicaion.use.case/delete.user.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepositorySql } from '../sql.infrastructure/users-query-repository-sql';
import { UsersQueryRepositoryTypeORM } from '../infrastructure.TypeORM/users.query.repository.TypeORM';

// Tag для swagger

@ApiTags('Users')
@Controller('sa/users')
// Установка guard на весь контроллер
//@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected userQueryRepositorySql: UsersQueryRepositorySql,
    protected usersQuery: UsersQueryRepositoryTypeORM,
    private commandBus: CommandBus,
  ) {}
  @Get()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: QueryUsersRequestType) {
    const { sortData, searchData } = createQuery(query);
    return await this.usersQuery.getAllUsers(sortData, searchData);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createModel: UserCreateInputModel) {
    console.log(' start');
    console.log(createModel.password, createModel.login, createModel.email);
    const createdUserId = await this.commandBus.execute(
      new CreateUserUseCaseCommand(createModel),
    );
    return await this.usersQuery.getById(createdUserId);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.usersQuery.getDeletedStatus(id);
    await this.commandBus.execute(new DeleteUserUseCaseCommand(id));
  }

  @Get()
  async hello() {
    // @Res({ passthrough: true }) res: Response, // // чтобы работал механизм возврата ответа с помощью return data; или res.json(data) // // При работе с данным декоратором необходимо установить passthrough: true // // Для работы с response (импорт Response из express) // @Req() req: Request, // // Для работы с request (импорт Request из express) // @Query('id', NumberPipe) id: number, // // Для работы с query применяя наш кастомный pipe
    return 'Hello';
  }

  // @Post()
  // // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  // @HttpCode(200)
  // async create(@Body() createModel: UserCreateModel): Promise<UserOutputModel> {
  //   const result = await this.usersService.create(
  //     createModel.email,
  //     createModel.name,
  //   );
  //
  //   return await this.usersQueryRepository.getById(result);
  // }

  // :id в декораторе говорит nest о том что это параметр
  // Можно прочитать с помощью @Param("id") и передать в property такое же название параметра
  // Если property не указать, то вернется объект @Param()
  // @Delete(':id')
  // // Установка guard на данный роут
  // @UseGuards(AuthGuard)
  // // Pipes из коробки https://docs.nestjs.com/pipes#built-in-pipes
  // async delete(@Param('id', ParseIntPipe) id: number) {
  //   return id;
  // }
}
