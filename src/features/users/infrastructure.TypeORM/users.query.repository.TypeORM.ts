import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../domain/user.entities.typeORM';
import { Like, Repository } from 'typeorm';
import { UserOutputDto } from '../api/models/output/output';
import { PostOutputDtoOne } from '../../blogs/posts/api/models/output/output.types';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../base/adapters/query/types';

@Injectable()
export class UsersQueryRepositoryTypeORM {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
  ) {}

  async getById(id: string) {
    try {
      const result = this.users.findOne({
        where: { id },
        select: ['id', 'login', 'email', 'createdAt'],
      });
      if (!result) throw new NotFoundException();
      return result;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  async getDeletedStatus(id: string) {
    try {
      const result = await this.users.findOne({
        where: { id },
        select: ['isDeleted'],
      });
      console.log('***', result);
      if (result?.isDeleted || result == null) throw new NotFoundException();
      return result;
    } catch {
      throw new NotFoundException([
        { message: 'User is deleted', field: 'getDeletedStatus' },
      ]);
    }
  }
}
