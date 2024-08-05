import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserOutputDto } from '../api/models/output/output';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../base/adapters/query/types';
import { getAuthTypeEndpointMe } from '../../security/auth/api/model/output/output';

@Injectable()
export class UsersQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

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

  async getById(id: string): Promise<UserOutputDto> {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "id", "login", "email", "createdAt" FROM "Users"
             WHERE "id" =  $1`,
        [id],
      );
      return result[0];
    } catch {
      throw new NotFoundException();
    }
  }

  async getUserAuthMe(id: string): Promise<getAuthTypeEndpointMe> {
    const user = await this.dataSource.query(
      `
    SELECT * FROM "Users" 
    WHERE "id" = $1`,
      [id],
    );
    if (user.length <= 0) throw new UnauthorizedException('User not found');
    return {
      login: user[0].login,
      email: user[0].email,
      userId: user[0].id,
    };
  }
}
