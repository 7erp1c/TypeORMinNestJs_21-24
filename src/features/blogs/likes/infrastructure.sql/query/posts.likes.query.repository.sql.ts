import {
  LikeStatusType,
  NewestLikeType,
  PostsLikesInfoType,
} from '../../api/model/input/input.types';
import { PostsLikesDocument } from '../../domain/likes.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsLikesQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getLikes(postId: string, userId?: string): Promise<PostsLikesInfoType> {
    let likeStatus: LikeStatusType = 'None';
    console.log('postId', postId);
    console.log('userId', userId);
    if (userId) {
      const userLike = await this.dataSource.query(
        `
          SELECT * FROM "PostsLikes"
            WHERE "postId" = $1 
            AND "likedUserId" = $2
            `,
        [postId, userId],
      );
      if (userLike.length > 0) {
        likeStatus = userLike[0].status;
      }
    }
    console.log('likeStatus', likeStatus);

    const likesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "PostsLikes"
              WHERE "postId" = $1 
                AND status = 'Like'`,
      [postId],
    );
    const likesCount = parseInt(likesResult[0].count, 10);

    const dislikesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "PostsLikes"
              WHERE "postId" = $1 
                AND status = 'Dislike'`,
      [postId],
    );
    const dislikesCount = parseInt(dislikesResult[0].count, 10);
    const newestLikes: Array<PostsLikesDocument> = await this.dataSource.query(
      `
         SELECT *
            FROM "PostsLikes"
             WHERE "postId" = $1 AND status = 'Like'
              ORDER BY "addedAt" DESC
               LIMIT 3
      `,
      [postId],
    );

    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: likeStatus,
      newestLikes: newestLikes.map(postLikesMapper),
    };
  }
}

export const postLikesMapper = (like: PostsLikesDocument): NewestLikeType => {
  return {
    addedAt: like.addedAt,
    userId: like.likedUserId,
    login: like.likedUserName,
  };
};
