import { Module } from '@nestjs/common';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsLikesRepository } from './likes/infrastructure/comments.likes.repository';
import { PostsLikesQueryRepository } from './likes/infrastructure/query/posts.likes.query.repository';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { PostsService } from './posts/aplication/posts.service';
import { CommentsService } from './comments/aplication/comments.service';
import { BlogsService } from './blogs/aplication/blogs.service';
import { LikesCommentsService } from './likes/aplication/likes.comments.service';
import { LikesPostService } from './likes/aplication/likes.post.service';
import { PostLikesRepository } from './likes/infrastructure/post.likes.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository';
import { CommentsLikesQueryRepository } from './likes/infrastructure/query/comments.likes.query.repository';
import { Blog, BlogSchema } from './blogs/domain/blogs.entity';
import { Post, PostsSchema } from './posts/domain/posts.entity';
import { CommentSchema, CommentsDb } from './comments/domain/comments.entity';
import {
  CommentLikes,
  CommentLikesSchema,
  PostsLikes,
  PostsLikesSchema,
} from './likes/domain/likes.entity';
import { DateCreate } from '../../base/adapters/get-current-date';
import { BlogExistsValidator } from '../../common/decorators/validate/blogId/isBlogExist';
import { RandomNumberService } from '../../common/service/random/randomNumberUUVid';
import { JwtService } from '@nestjs/jwt';
import { BlogsRepositorySql } from './blogs/infrastructure.sql/blogs.repository.sql';
import { BlogsQueryRepositorySql } from './blogs/infrastructure.sql/blogs.query.repository.sql';
import { PostsRepositorySql } from './posts/infrastructure.sql/posts.repository.sql';
import { PostsQueryRepositorySql } from './posts/infrastructure.sql/posts.query.repository.sql';
import { PostsLikesQueryRepositorySql } from './likes/infrastructure.sql/query/posts.likes.query.repository.sql';
import { PublicBlogsController } from './blogs/api/public.blogs.controller';
import { CommentsQueryRepositorySql } from './comments/infrastructure.sql/comments.query.repository.sql';
import { CommentsRepositorySql } from './comments/infrastructure.sql/comments.repository.sql';
import { CommentsLikesQueryRepositorySql } from './likes/infrastructure.sql/query/comments.likes.query.repository.sql';
import { PostLikesRepositorySql } from './likes/infrastructure.sql/post.likes.repository.sql';
import { CommentsLikesRepositorySql } from './likes/infrastructure.sql/comments.likes.repository.sql';

const controllers = [
  BlogsController,
  PostsController,
  CommentsController,
  PublicBlogsController,
];

const services = [
  BlogsService,
  PostsService,
  CommentsService,
  LikesCommentsService,
  LikesPostService,
];

const repositories = [
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  CommentsLikesRepository,
  PostsLikesQueryRepository,
  PostLikesRepository,
  PostsRepositorySql, //sql
  BlogsRepositorySql, //sql
  CommentsRepositorySql, //sql
  PostLikesRepositorySql, //sql
  CommentsLikesRepositorySql, //sql
];

const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  CommentsLikesQueryRepository,
  PostsLikesQueryRepositorySql, //sql
  BlogsQueryRepositorySql, //sql
  PostsQueryRepositorySql, //sql
  CommentsQueryRepositorySql, //sql
  CommentsLikesQueryRepositorySql, //sql
];

const providers = [
  BlogExistsValidator,
  RandomNumberService,
  DateCreate,
  JwtService,
];

const mongooseImports = [
  MongooseModule.forFeature([
    {
      name: Blog.name,
      schema: BlogSchema,
    },
    {
      name: Post.name,
      schema: PostsSchema,
    },
    {
      name: CommentsDb.name,
      schema: CommentSchema,
    },

    {
      name: CommentLikes.name,
      schema: CommentLikesSchema,
    },
    {
      name: PostsLikes.name,
      schema: PostsLikesSchema,
    },
  ]),
];

@Module({
  imports: [UsersModule, ...mongooseImports],
  controllers: [...controllers],
  providers: [...services, ...repositories, ...queryRepositories, ...providers],
  exports: [],
})
export class BlogsModule {}
