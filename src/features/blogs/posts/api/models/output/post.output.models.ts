import { PostsLikesInfoType } from '../../../../likes/api/model/input/input.types';
import { WithId } from 'mongodb';
import { PostOutputDto, PostType } from './output.types';

export const postMapper = (
  post: WithId<PostType>,
  likes: PostsLikesInfoType,
): PostOutputDto => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: likes,
  };
};
export const postMapperSql = (
  post: PostOutputDto,
  likes: PostsLikesInfoType,
): PostOutputDto => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: likes,
  };
};
