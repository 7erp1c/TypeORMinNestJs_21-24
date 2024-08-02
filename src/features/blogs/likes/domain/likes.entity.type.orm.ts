import { LikeStatusType } from '../api/model/input/input.types';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'CommentsLikes' })
export class CommentLike {
  @PrimaryColumn()
  commentId: string;

  @Column()
  likedUserId: string;

  @Column()
  status: LikeStatusType;
}

@Entity({ name: 'PostsLikes' })
export class PostsLike {
  @PrimaryColumn()
  postId: string;

  @Column()
  likedUserId: string;

  @Column()
  likedUserName: string;

  @Column()
  addedAt: string;

  @Column()
  status: LikeStatusType;
}
