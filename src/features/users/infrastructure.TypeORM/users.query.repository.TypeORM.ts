import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Users } from '../domain/user.entities.typeORM';
import { DataSource, Repository } from 'typeorm';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../base/adapters/query/types';

@Injectable()
export class UsersQueryRepositoryTypeORM {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getAllUsers(sortData: QuerySortType, searchData: QuerySearchType) {
    const sortKeyMap = {
      login: `"login"`,
      email: `"email"`,
      default: `"createdAt"`,
    };
    const sortKey = sortKeyMap[sortData.sortBy] || sortKeyMap.default;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;

    // Создание условий поиска
    const searchConditions: string[] = [];
    const queryParams: string[] = [];

    if (searchData.searchLoginTerm) {
      searchConditions.push(`"login" ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${searchData.searchLoginTerm}%`);
    }
    if (searchData.searchEmailTerm) {
      searchConditions.push(`"email" ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${searchData.searchEmailTerm}%`);
    }

    // Подсчет общего количества пользователей
    const documentsTotalCountQuery = `
  SELECT COUNT(*)
  FROM "Users"
  WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
`;
    const documentsTotalCountResult = await this.dataSource.query(
      documentsTotalCountQuery,
      queryParams,
    );
    const documentsTotalCount = parseInt(
      documentsTotalCountResult[0].count,
      10,
    );

    // Расчет смещения для пагинации
    const skippedDocuments = (sortData.pageNumber - 1) * sortData.pageSize;
    //ORDER BY ${sortKey} ${sortDirection}
    // Получение пользователей из базы данных
    const usersQuery = `
  SELECT *
  FROM "Users"
  WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
  AND "isDeleted" = false
  ORDER BY ${sortKey} ${sortDirection}
  OFFSET ${skippedDocuments}
  LIMIT ${sortData.pageSize}
`;
    const users = await this.dataSource.query(usersQuery, queryParams);

    // Расчет количества страниц
    const pageCount = Math.ceil(documentsTotalCount / sortData.pageSize);

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: users.map((item) => ({
        id: item.id,
        login: item.login,
        email: item.email,
        createdAt: item.createdAt,
      })),
    };
  }

  async getById(id: string) {
    try {
      const query = await this.usersRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
        .where('id = :id', { id })
        .andWhere('u.isDeleted = false');
      console.log('Query:', query.getSql());
      const result = await query.getOne();
      if (!result) throw new NotFoundException();
      return result;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }

  // async getDeletedStatus(id: string) {
  //   try {
  //     const result = await this.usersRepository.findOne({
  //       where: { id },
  //       select: ['isDeleted'],
  //     });
  //     console.log('***', result);
  //     if (result?.isDeleted || result == null) throw new NotFoundException();
  //     return result;
  //   } catch {
  //     throw new NotFoundException([
  //       { message: 'User is deleted', field: 'getDeletedStatus' },
  //     ]);
  //   }
  // }
  async getDeletedStatus(id: string) {
    try {
      const result = await this.usersRepository
        .createQueryBuilder('u')
        .select('u.isDeleted')
        .where('u.id=:id', { id })
        .getOne();

      if (result?.isDeleted || result == null) throw new NotFoundException();
      console.log(result);
      return result;
    } catch {
      throw new NotFoundException([
        { message: 'User is deleted', field: 'getDeletedStatus' },
      ]);
    }
  }
}
