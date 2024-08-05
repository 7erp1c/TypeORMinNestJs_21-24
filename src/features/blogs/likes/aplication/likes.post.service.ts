import { PostsLikesInputModel } from '../api/model/input/likes.input.models';
import { Injectable } from '@nestjs/common';
import { PostLikesRepository } from '../infrastructure/post.likes.repository';
import { PostsLikes } from '../domain/likes.entity';
import { DateCreate } from '../../../../base/adapters/get-current-date';
import { PostLikesRepositorySql } from '../infrastructure.sql/post.likes.repository.sql';
@Injectable()
export class LikesPostService {
  constructor(
    protected dateCreate: DateCreate,
    protected postLikesRepository: PostLikesRepository,
    protected postLikesRepositorySql: PostLikesRepositorySql,
  ) {}
  async createLikePost(
    userId: string,
    login: string,
    postId: string,
    inputModel: PostsLikesInputModel,
  ) {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const likesDto: PostsLikes = {
      postId: postId,
      likedUserId: userId,
      likedUserName: login,
      addedAt: createdAt,
      status: inputModel.likeStatus,
    };
    //await this.postLikesRepository.updatePostLike(likesDto);//mongoose
    await this.postLikesRepositorySql.updatePostLike(likesDto);
  }
}
