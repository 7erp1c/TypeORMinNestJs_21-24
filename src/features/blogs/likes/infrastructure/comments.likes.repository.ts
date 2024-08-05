import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLikes } from '../domain/likes.entity';
import { Model } from 'mongoose';

@Injectable()
export class CommentsLikesRepository {
  constructor(
    @InjectModel(CommentLikes.name)
    private readonly commentLikeModel: Model<CommentLikes>,
  ) {}
  async updateOrCreateCommentLike(updateModel: CommentLikes) {
    const like = await this.commentLikeModel.findOne({
      $and: [
        { likedUserId: updateModel.likedUserId },
        { commentId: updateModel.commentId },
      ],
    });

    if (like) {
      // like.status = updateModel.status;
      // like.save();
      await this.commentLikeModel.updateOne(
        { _id: like._id },
        {
          $set: {
            status: updateModel.status,
          },
        },
      );
    } else {
      await this.commentLikeModel.create(updateModel);
    }
  }
}
