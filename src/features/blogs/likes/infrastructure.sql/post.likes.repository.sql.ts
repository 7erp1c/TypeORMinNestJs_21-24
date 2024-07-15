import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeDto } from '../api/model/input/input.types';

@Injectable()
export class PostLikesRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async updatePostLike(inputModel: PostLikeDto) {
    // const like = await PostLikeModel.findOne({$and: [{likedUserId: updateModel.likedUserId}, {postId: updateModel.postId}]});

    const like = await this.dataSource.query(
      `
      UPDATE public."PostsLikes"
      SET "status" = $3,"addedAt" = $4
      WHERE "likedUserId" = $1
      AND "postId" = $2
      `,
      [
        inputModel.likedUserId,
        inputModel.postId,
        inputModel.status,
        inputModel.addedAt,
      ],
    );
    //если нет лаЙка:
    if (like[1] === 0) {
      await this.dataSource.query(
        `
        INSERT INTO public."PostsLikes"
        ("postId", "likedUserId", "likedUserName", "addedAt", "status")
        values($1,$2,$3,$4,$5)`,
        [
          inputModel.postId,
          inputModel.likedUserId,
          inputModel.likedUserName,
          inputModel.addedAt,
          inputModel.status,
        ],
      );
    }
  }
}
