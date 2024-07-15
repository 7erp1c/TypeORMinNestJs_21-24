import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PostOutputDto,
  PostOutputDtoOne,
} from '../api/models/output/output.types';
import { postMapperSql } from '../api/models/output/post.output.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsLikesQueryRepositorySql } from '../../likes/infrastructure.sql/query/posts.likes.query.repository.sql';
import { SortPostRepositoryType } from '../../../users/api/models/input/input';

@Injectable()
export class PostsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsLikesQueryRepositorySql: PostsLikesQueryRepositorySql,
  ) {}

  async getAllPosts(
    sortData: SortPostRepositoryType,
    blogId?: string,
    userId?: string,
  ) {
    const sortKeyMap = {
      blogName: `"blogName"`,
      default: `"createdAt"`,
    };
    const sortKey = sortKeyMap[sortData.sortBy] || sortKeyMap.default;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;

    // Создание условий поиска
    const queryParams: string[] = [];
    let blogIdCondition = '';
    if (blogId) {
      blogIdCondition = `AND "blogId" = $1`;
      queryParams.push(blogId);
    }

    // Подсчет общего количества постов
    const documentsTotalCountQuery = `
  SELECT COUNT(*)
  FROM "Posts"
  WHERE "isDeleted" = false
  ${blogIdCondition}
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
  FROM public."Posts"
  WHERE "isDeleted" = false
  ${blogIdCondition}
  ORDER BY ${sortKey} ${sortDirection}
  OFFSET ${skippedDocuments}
  LIMIT ${sortData.pageSize}
`;
    const posts = await this.dataSource.query(blogsQuery, queryParams);

    // Расчет количества страниц
    const pageCount = Math.ceil(documentsTotalCount / sortData.pageSize);

    const mappedPosts: PostOutputDto[] = [];

    for (let i = 0; i < posts.length; i++) {
      const likes = await this.postsLikesQueryRepositorySql.getLikes(
        posts[i].id.toString(),
        userId,
      );
      mappedPosts.push(postMapperSql(posts[i], likes));
    }

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: mappedPosts,
    };
  }

  async getPostById(
    id: string,
    userId: string | null = null,
  ): Promise<PostOutputDto> {
    try {
      const post = await this.dataSource.query(
        `SELECT *
          FROM "Posts" 
           WHERE "id" = $1
           AND "isDeleted" = false
        `,
        [id],
      );
      if (!post)
        throw new NotFoundException([
          {
            message: 'Post not found',
            field: 'getPostById',
          },
        ]);
      const likes = await this.postsLikesQueryRepositorySql.getLikes(
        id,
        userId!,
      );
      return postMapperSql(post[0], likes);
    } catch (error) {
      throw new NotFoundException([
        {
          message: error,
          field: 'getPostById',
        },
      ]);
    }
  }

  async getDeletedStatus(id: string): Promise<PostOutputDtoOne> {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "isDeleted"
               FROM "Posts"
                 WHERE "id" =  $1`,
        [id],
      );
      return result[0].isDeleted;
    } catch {
      throw new NotFoundException([
        { message: 'Post not found', field: 'getDeletedStatus' },
      ]);
    }
  }
}
