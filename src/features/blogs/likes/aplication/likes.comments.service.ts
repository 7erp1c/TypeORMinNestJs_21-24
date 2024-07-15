import { CommentLikes } from '../domain/likes.entity';
import { PostsLikesInputModel } from '../api/model/input/likes.input.models';
import { CommentsLikesRepository } from '../infrastructure/comments.likes.repository';
import { Injectable } from '@nestjs/common';
import { CommentsLikesRepositorySql } from '../infrastructure.sql/comments.likes.repository.sql';

@Injectable()
export class LikesCommentsService {
  constructor(
    protected commentsLikesRepository: CommentsLikesRepository,
    protected commentsLikesRepositorySql: CommentsLikesRepositorySql,
  ) {}

  async updateOrCreateCommentLike(
    commentId: string,
    status: PostsLikesInputModel,
    userId: string,
  ) {
    const updateModel: CommentLikes = {
      commentId: commentId,
      likedUserId: userId,
      status: status.likeStatus,
    };
    //await this.CommentsLikesRepository.updateOrCreateCommentLike(updateModel);//mongoose
    await this.commentsLikesRepositorySql.updateOrCreateCommentLike(
      updateModel,
    );
  }
}
