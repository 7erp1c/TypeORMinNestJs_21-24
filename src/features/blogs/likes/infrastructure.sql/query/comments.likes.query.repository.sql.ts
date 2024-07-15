import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesInfoType } from '../../api/model/output/output';
import { LikeStatusType } from '../../api/model/input/input.types';

@Injectable()
export class CommentsLikesQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getLikes(commentId: string, userId?: string): Promise<LikesInfoType> {
    let likeStatus: LikeStatusType = 'None';

    if (userId) {
      const userLike = await this.dataSource.query(
        `
          SELECT * FROM "CommentsLikes"
            WHERE "commentId" = $1 
            AND "likedUserId" = $2
            `,
        [commentId, userId],
      );
      if (userLike.length > 0) {
        likeStatus = userLike[0].status;
      }
    }
    console.log(likeStatus);
    const likesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "CommentsLikes"
              WHERE "commentId" = $1 
                AND status = 'Like'`,
      [commentId],
    );
    const likesCount = parseInt(likesResult[0].count, 10);

    const dislikesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "CommentsLikes"
              WHERE "commentId" = $1 
                AND status = 'Dislike'`,
      [commentId],
    );
    const dislikesCount = parseInt(dislikesResult[0].count, 10);

    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: likeStatus,
    };
  }
}
