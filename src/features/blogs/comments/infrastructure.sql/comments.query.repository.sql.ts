import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesInfoType } from '../../likes/api/model/output/output';
import { getCommentsViewSql } from '../api/output/mapper';
import { CommentsLikesQueryRepositorySql } from '../../likes/infrastructure.sql/query/comments.likes.query.repository.sql';
import {
  CommentsViewModelType,
  SortCommentsRepositoryType,
} from '../api/output/promise.query';
import { CommentViewOutput } from '../api/output/type';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected commentsLikesQueryRepositorySql: CommentsLikesQueryRepositorySql,
  ) {}

  async getAllCommentsForPost(
    sortData: SortCommentsRepositoryType,
    postId?: string,
    userId?: string,
  ): Promise<CommentsViewModelType> {
    const sortKeyMap = {
      userLogin: `"userLogin"`,
      default: `"createdAt"`,
    };
    const sortKey = sortKeyMap[sortData.sortBy] || sortKeyMap.default;
    const sortDirection = sortData.sortDirection === 'asc' ? `ASC` : `DESC`;
    let postIdCondition = '';
    // Создание условий поиска
    const queryParams: string[] = [];
    if (postId) {
      postIdCondition = `AND "postId" = $1`;
      queryParams.push(postId);
    }

    // Подсчет общего количества комментов
    const documentsTotalCountQuery = `
  SELECT COUNT(*)
  FROM "Comments"
  WHERE "isDeleted" = false
  ${postIdCondition}
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
    const commentsQuery = `
  SELECT *
  FROM public."Comments"
  WHERE "isDeleted" = false
  ${postIdCondition}
  ORDER BY ${sortKey} ${sortDirection}
  OFFSET ${skippedDocuments}
  LIMIT ${sortData.pageSize}
`;
    const comments = await this.dataSource.query(commentsQuery, queryParams);

    // Расчет количества страниц
    const pageCount = Math.ceil(documentsTotalCount / sortData.pageSize);

    const mappedComments: CommentViewOutput[] = [];

    for (let i = 0; i < comments.length; i++) {
      const likes = await this.commentsLikesQueryRepositorySql.getLikes(
        comments[i].id.toString(),
        userId,
      );
      mappedComments.push(getCommentsViewSql(comments[i], likes));
    }

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: mappedComments,
    };
  }

  async getCommentById(commentId: string, userId?: string) {
    try {
      const comment = await this.dataSource.query(
        `SELECT *
          FROM "Comments" 
           WHERE "id" = $1
           AND "isDeleted" = false
        `,
        [commentId],
      );
      console.log(comment[0]);
      if (!comment[0])
        throw new NotFoundException([
          {
            message: 'Comment not found',
            field: 'getCommentById',
          },
        ]);
      const likes: LikesInfoType =
        await this.commentsLikesQueryRepositorySql.getLikes(commentId, userId!);
      return getCommentsViewSql(comment[0], likes);
    } catch (error) {
      throw new NotFoundException([
        {
          message: error,
          field: 'getCommentById',
        },
      ]);
    }
  }

  async getDeletedStatus(id: string) {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "isDeleted"
               FROM "Comments"
                 WHERE "id" =  $1`,
        [id],
      );
      return result[0].isDeleted;
    } catch {
      throw new NotFoundException([
        { message: 'Comment not found', field: 'getDeletedStatus' },
      ]);
    }
  }
}
