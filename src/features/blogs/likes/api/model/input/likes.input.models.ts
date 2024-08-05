import { IsIn } from 'class-validator';
import { LikeStatusType } from './input.types';

export class CommentsLikesInputModel {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: LikeStatusType;
}

export class PostsLikesInputModel {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: LikeStatusType;
}
