import { LikeStatusType } from '../api/model/input/input.types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'CommentsLikes' })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  commentId: string;

  @Column()
  likedUserId: string;

  @Column()
  status: LikeStatusType;
}

@Entity({ name: 'PostsLikes' })
export class PostsLike {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
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
