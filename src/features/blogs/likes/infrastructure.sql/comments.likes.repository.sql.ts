import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentLikes } from '../domain/likes.entity';
@Injectable()
export class CommentsLikesRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async updateOrCreateCommentLike(updateModel: CommentLikes) {
    const like = await this.dataSource.query(
      `
      UPDATE public."CommentsLikes"
      SET status = $3
      WHERE "likedUserId" = $1
      AND "commentId" = $2
      `,
      [updateModel.likedUserId, updateModel.commentId, updateModel.status],
    );
    //если нет лаЙка:
    if (like[1] === 0) {
      await this.dataSource.query(
        `
        INSERT INTO public."CommentsLikes"
        ("commentId", "likedUserId", status)
        values($1,$2,$3)`,
        [updateModel.commentId, updateModel.likedUserId, updateModel.status],
      );
    }
  }
}
