import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsDb } from '../domain/comments.entity';
import { ObjectId } from 'mongodb';
import { CommentUpdateInputModel } from '../api/input/comments.input.model';

@Injectable()
export class CommentsRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getCommentById(id) {
    try {
      const result = await this.dataSource.query(
        `
        SELECT * FROM public."Comments"
        WHERE id = $1
        `,
        [id],
      );

      if (result.length <= 0) throw new NotFoundException('Comment not found');
      return result[0];
    } catch (error) {
      throw new NotFoundException('Comment not found');
    }
  }
  async createComment(commentDto: CommentsDb): Promise<string> {
    try {
      const newComment = await this.dataSource.query(
        `
      INSERT INTO "Comments"
      ("content","postId","userId","userLogin","createdAt") 
      values($1, $2, $3, $4, $5)
      RETURNING id`,
        [
          commentDto.content,
          commentDto.postId,
          commentDto.commentatorInfo.userId,
          commentDto.commentatorInfo.userLogin,
          commentDto.createdAt,
        ],
      );
      return newComment[0].id;
    } catch {
      throw new NotFoundException([
        {
          message: 'comment not created',
          field: 'CommentsRepositorySql.createComment',
        },
      ]);
    }
  }

  async updateComment(id: string, inputModel: CommentUpdateInputModel) {
    try {
      const result = await this.dataSource.query(
        `
        UPDATE public."Comments"
        SET "content" = $2
        WHERE "id" = $1
        `,
        [id, inputModel.content],
      );

      if (result[1] === 0) throw new NotFoundException('Comment not found');
    } catch {
      throw new NotFoundException([
        {
          message: 'Comment not found',
          field: 'CommentsRepositorySql.updateComment',
        },
      ]);
    }
  }

  async deleteComments(id: string) {
    try {
      const deleteStatus = true;
      const isDeleted = await this.dataSource.query(
        `
        UPDATE public."Comments"
        SET "isDeleted" = $2
        WHERE "id" = $1
        `,
        [id, deleteStatus],
      );
      if (isDeleted[1] === 0)
        throw new NotFoundException([
          {
            message: 'Comment not found',
            field: 'CommentsRepositorySql.deleteComments',
          },
        ]);
      return true;
    } catch (error) {
      throw new NotFoundException([
        {
          message: 'Comment not found',
          field: 'CommentsRepositorySql.deleteComments',
        },
      ]);
    }
  }
}
