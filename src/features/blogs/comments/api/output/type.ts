import { LikesInfoType } from '../../../likes/api/model/output/output';
import { Schema } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export class CommentViewOutput {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string | undefined;
    userLogin: string | undefined;
  };
  createdAt: string;
  likesInfo: LikesInfoType;
}
@Schema()
export class CommentView {
  _id: ObjectId;
  content: string;
  commentatorInfo: {
    userId: string | undefined;
    userLogin: string | undefined;
  };
  createdAt: string;
}
@Schema()
export class CommentViewSql {
  id: string;
  content: string;
  userId: string | undefined;
  userLogin: string | undefined;
  createdAt: string;
}
