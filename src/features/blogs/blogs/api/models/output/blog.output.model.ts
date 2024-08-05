import { BlogTypeOutput } from './output';
import { WithId } from 'mongodb';
import { BlogTypeCreate } from '../input/input';

export const BlogOutputModelMapper = (
  blog: WithId<BlogTypeCreate>,
): BlogTypeOutput => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
export const BlogOutputModelMapperSql = (
  blog: BlogTypeOutput,
): BlogTypeOutput => {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
