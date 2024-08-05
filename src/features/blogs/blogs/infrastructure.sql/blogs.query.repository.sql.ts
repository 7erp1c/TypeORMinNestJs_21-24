import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogTypeOutput } from '../api/models/output/output';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../../base/adapters/query/types';
import { BlogOutputModelMapperSql } from '../api/models/output/blog.output.model';

@Injectable()
export class BlogsQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllBlogs(sortData: QuerySortType, searchData: QuerySearchType) {
    const sortKeyMap = {
      name: `"name"`,
      default: `"createdAt"`,
    };
    const sortKey = sortKeyMap[sortData.sortBy] || sortKeyMap.default;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;

    // Создание условий поиска
    const searchConditions: string[] = [];
    const queryParams: string[] = [];

    if (searchData.searchNameTerm) {
      searchConditions.push(`"name" ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${searchData.searchNameTerm}%`);
    }
    // if (searchData.searchEmailTerm) {
    //   searchConditions.push(`"email" ILIKE $${queryParams.length + 1}`);
    //   queryParams.push(`%${searchData.searchEmailTerm}%`);
    // }

    // Подсчет общего количества пользователей
    const documentsTotalCountQuery = `
  SELECT COUNT(*)
  FROM "Blogs"
  WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
  AND "isDeleted" = false
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

    // Получение пользователей из базы данных
    const blogsQuery = `
  SELECT *
  FROM public."Blogs"
  WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
  AND "isDeleted" = false
  ORDER BY ${sortKey} ${sortDirection}
  OFFSET ${skippedDocuments}
  LIMIT ${sortData.pageSize}
`;
    const blogs = await this.dataSource.query(blogsQuery, queryParams);

    // Расчет количества страниц
    const pageCount = Math.ceil(documentsTotalCount / sortData.pageSize);

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: blogs.map(BlogOutputModelMapperSql),
    };
  }

  async getById(id: string): Promise<BlogTypeOutput> {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "id", "name", "description",
         "websiteUrl","createdAt","isMembership"
               FROM "Blogs"
                 WHERE "id" =  $1
                 AND "isDeleted" = false`,
        [id],
      );
      return result[0];
    } catch {
      throw new NotFoundException();
    }
  }
  async getDeletedStatus(id: string): Promise<BlogTypeOutput> {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "isDeleted"
               FROM "Blogs"
                 WHERE "id" =  $1`,
        [id],
      );
      return result[0].isDeleted;
    } catch {
      throw new NotFoundException();
    }
  }
}
