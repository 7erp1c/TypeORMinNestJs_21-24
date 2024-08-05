import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginOrEmailInputModel } from '../../security/auth/api/model/input/loginOrEmailInputModel';
import { Error } from 'mongoose';
import { Users } from '../domain/user.entities.typeORM';

@Injectable()
export class UsersRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users) private readonly repository: Repository<Users>,
  ) {}

  // async deleteUser(id: string) {
  //   try {
  //     const result = await this.dataSource.query(
  //       `DELETE FROM public."Users"
  //       WHERE "id" = $1`,
  //       [id],
  //     );
  //     console.log('result.rowCount', result);
  //     console.log('result.rowCount', result.rowCount);
  //
  //     if (result[1] === 0) throw new NotFoundException('User not found');
  //     return result;
  //   } catch (error) {
  //     throw new NotFoundException('User not found');
  //   }
  // }

  async updateUserConfirmationAccount(
    email: string,
    code: string,
    date: string,
  ) {
    try {
      const isUpdated = await this.dataSource.query(
        `UPDATE public."Users" 
                SET "confirmationCode" = $1, "expirationDate" = $2, "isConfirmed" = false
                WHERE "email" = $3  `,
        [code, date, email],
      );
      if (isUpdated[1] === 0) throw new NotFoundException('User not found');
      return true;
    } catch (err) {
      return new Error('Not update emailConfirmation');
    }
  }

  async updateConfirmationStatus(code: string, date: string) {
    try {
      const isUpdated = await this.dataSource.query(
        `UPDATE public."Users"
               SET "expirationDate" = $1, "isConfirmed" = 'true'
               WHERE "confirmationCode" = $2`,
        [date, code],
      );
      if (isUpdated[1] === 0) throw new NotFoundException('User not found');
      return true;
    } catch (err) {
      return new Error('Not update emailConfirmation');
    }
  }

  public async valueIsExist(columnName: string, value: string) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Users" WHERE "${columnName}" = \$1`,
      [value],
    );
    const count = parseInt(result[0].count, 10);
    return count > 0;
  }

  async getUserByCode(code: string) {
    try {
      const result = await this.dataSource.query(
        `SELECT *
               FROM "Users" 
               WHERE "recoveryCode" = $1
               OR "confirmationCode" = $2
               `,
        [code, code],
      );
      if (result.length <= 0)
        throw new BadRequestException([
          {
            message: 'code already exist',
            field: 'code',
          },
        ]);
      return result[0];
    } catch {
      throw new BadRequestException([
        {
          message: 'code already exist',
          field: 'code',
        },
      ]);
    }
  }

  async getUserById(id: string) {
    try {
      const result = await this.repository.findOneBy({ id: id });
      console.log('getUserById', result);
      if (!result || result.isDeleted) throw new NotFoundException();
      return result;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async getUserByLoginOrEmail(InputModel: LoginOrEmailInputModel) {
    const result = await this.repository.findOne({
      where: [
        { email: InputModel.loginOrEmail },
        { login: InputModel.loginOrEmail },
      ],
    });
    if (!result)
      throw new UnauthorizedException([
        {
          field: 'code',
          message: 'code already exist',
        },
      ]);
    return result;
  }

  async getUserByEmail(email: string) {
    try {
      const result = await this.dataSource.query(
        `SELECT *
               FROM "Users" 
               WHERE "email" = \$1
`,
        [email],
      );
      if (result.length <= 0) throw new BadRequestException();
      return result[0];
    } catch {
      throw new BadRequestException([
        {
          message: 'email missing in Db',
          field: 'email',
        },
      ]);
    }
  }
}
