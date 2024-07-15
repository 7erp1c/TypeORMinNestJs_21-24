import { BadRequestException, Injectable } from '@nestjs/common';
import { PostLikeDto } from '../api/model/input/input.types';
import { InjectModel } from '@nestjs/mongoose';
import { PostsLikes } from '../domain/likes.entity';
import { Model } from 'mongoose';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostsLikes.name) private postsLikesModel: Model<PostsLikes>,
  ) {}
  async updatePostLike(inputModel: PostLikeDto) {
    // const like = await PostLikeModel.findOne({$and: [{likedUserId: updateModel.likedUserId}, {postId: updateModel.postId}]});

    const like = await this.postsLikesModel.findOneAndUpdate(
      {
        $and: [
          { likedUserId: inputModel.likedUserId },
          { postId: inputModel.postId },
        ],
      },
      {
        $set: {
          status: inputModel.status,
          addedAt: inputModel.addedAt,
        },
      },
    );
    //если нет лаЙка:
    if (!like) {
      await this.postsLikesModel.create(inputModel);
    }
  }
}
