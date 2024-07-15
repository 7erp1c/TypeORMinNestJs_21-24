import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusType } from '../api/model/input/input.types';
import { HydratedDocument } from 'mongoose';

export type CommentLikesDocument = HydratedDocument<CommentLikes>;
export type PostsLikesDocument = HydratedDocument<PostsLikes>;

@Schema()
export class CommentLikes {
  @Prop()
  commentId: string;

  @Prop()
  likedUserId: string;

  @Prop()
  status: LikeStatusType;
}

@Schema()
export class PostsLikes {
  @Prop()
  postId: string;

  @Prop()
  likedUserId: string;

  @Prop()
  likedUserName: string;

  @Prop()
  addedAt: string;

  @Prop()
  status: LikeStatusType;
}

export const CommentLikesSchema = SchemaFactory.createForClass(CommentLikes);
export const PostsLikesSchema = SchemaFactory.createForClass(PostsLikes);
