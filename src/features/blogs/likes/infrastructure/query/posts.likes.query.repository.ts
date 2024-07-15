import {
  LikeStatusType,
  NewestLikeType,
  PostsLikesInfoType,
} from '../../api/model/input/input.types';
import { PostsLikes, PostsLikesDocument } from '../../domain/likes.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class PostsLikesQueryRepository {
  constructor(
    @InjectModel(PostsLikes.name) private postsLikesModel: Model<PostsLikes>,
  ) {}

  async getLikes(postId: string, userId?: string): Promise<PostsLikesInfoType> {
    let likeStatus: LikeStatusType = 'None';

    if (userId) {
      const userLike = await this.postsLikesModel
        .findOne({ $and: [{ postId: postId }, { likedUserId: userId }] })
        .lean();
      if (userLike) {
        likeStatus = userLike.status;
      }
    }

    const likesCount = await this.postsLikesModel.countDocuments({
      $and: [{ postId: postId }, { status: 'Like' }],
    });
    const dislikesCount = await this.postsLikesModel.countDocuments({
      $and: [{ postId: postId }, { status: 'Dislike' }],
    });
    const newestLikes: Array<PostsLikesDocument> = await this.postsLikesModel
      .find({ $and: [{ postId: postId }, { status: 'Like' }] })
      .sort({ addedAt: 'desc' })
      .limit(3)
      .lean();

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
