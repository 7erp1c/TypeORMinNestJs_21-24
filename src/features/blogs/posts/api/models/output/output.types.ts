import { Schema } from '@nestjs/mongoose';
import { PostsLikesInfoType } from '../../../../likes/api/model/input/input.types';

@Schema()
export class PostType {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostsLikesInfoType;
}
export class PostOutputDtoOne {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}
