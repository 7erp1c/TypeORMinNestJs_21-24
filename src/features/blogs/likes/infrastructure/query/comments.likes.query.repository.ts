import { InjectModel } from '@nestjs/mongoose';
import { CommentLikes } from '../../domain/likes.entity';
import { Model } from 'mongoose';
import { LikesInfoType } from '../../api/model/output/output';
import { LikeStatusType } from '../../api/model/input/input.types';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CommentsLikesQueryRepository {
  constructor(
    @InjectModel(CommentLikes.name)
    private readonly commentLikesModel: Model<CommentLikes>,
  ) {}

  async getLikes(commentId: string, userId?: string): Promise<LikesInfoType> {
    let likeStatus: LikeStatusType = 'None';

    if (userId) {
      const userLike = await this.commentLikesModel
        .findOne({
          $and: [{ commentId: commentId }, { likedUserId: userId }],
        })
        .lean();
      if (userLike) {
        likeStatus = userLike.status;
      }
    }

    const likesCount = await this.commentLikesModel.countDocuments({
      $and: [{ commentId: commentId }, { status: 'Like' }],
    });
    const dislikesCount = await this.commentLikesModel.countDocuments({
      $and: [{ commentId: commentId }, { status: 'Dislike' }],
    });
    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: likeStatus,
    };
  }
}
