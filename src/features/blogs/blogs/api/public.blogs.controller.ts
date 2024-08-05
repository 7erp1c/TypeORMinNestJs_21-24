import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';
import { QueryBlogsRequestType } from './models/input/input';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { PostForBlog } from '../../posts/api/models/input/create.post.input.models';
import { PostsService } from '../../posts/aplication/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';

import { Request } from 'express';
import { AdminAuthGuard } from '../../../../common/guards/auth.admin.guard';
import { QueryUsersRequestType } from '../../../users/api/models/input/input';
import { createQuery } from '../../../../base/adapters/query/create.query';
import { BlindGuard } from '../../../../common/guards/blind.guard.token';
import { BlogsQueryRepositorySql } from '../infrastructure.sql/blogs.query.repository.sql';
import { PostsQueryRepositorySql } from '../../posts/infrastructure.sql/posts.query.repository.sql';

@ApiTags('pub.Blogs')
@Controller('/blogs')
export class PublicBlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
    protected blogsQueryRepositorySql: BlogsQueryRepositorySql,
    protected postsQueryRepositorySql: PostsQueryRepositorySql,
  ) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({
  //   status: 201,
  //   description: 'The record has been successfully created.',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAllBlogs(@Query() query: QueryBlogsRequestType) {
    const { sortData, searchData } = createQuery(query);
    return await this.blogsQueryRepositorySql.getAllBlogs(sortData, searchData);
  }

  // @Post()
  // @UseGuards(AdminAuthGuard)
  // @HttpCode(HttpStatus.CREATED)
  // async createBlog(
  //   @Body() CreateModel: CreateBlogInputModel,
  // ): Promise<BlogTypeOutput> {
  //   const createBlogId = await this.blogsService.createBlog(CreateModel);
  //   return await this.blogsQueryRepositorySql.getById(createBlogId);
  // }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryUsersRequestType,
    @Req() req: Request,
  ) {
    const { sortData } = createQuery(query);
    // const findBlogById = await this.blogsService.findBlogById(blogId);//mongoose
    const findBlogById = await this.blogsQueryRepositorySql.getById(blogId);
    if (!findBlogById) {
      throw new BadRequestException('Sorry bro, blog not found');
    }
    if (req.user && req.user.userId) {
      //return await this.postsQueryRepository.getAllPosts(//mongoose
      return await this.postsQueryRepositorySql.getAllPosts(
        sortData,
        findBlogById.id,
        req.user.userId,
      );
    } else {
      //return await this.postsQueryRepository.getAllPosts(//mongoose
      return await this.postsQueryRepositorySql.getAllPosts(
        sortData,
        findBlogById.id,
        undefined,
      );
    }
  }

  // @Post(':blogId/posts')
  // @UseGuards(AdminAuthGuard)
  // @HttpCode(HttpStatus.CREATED)
  // async createPostForBlog(
  //   @Param('blogId') blogId: string,
  //   @Body() inputModel: CreatePostInputModelByBlog,
  // ) {
  //   // const findBlogById = await this.blogsService.findBlogById(blogId);//mongoose
  //   const findBlogById = await this.blogsQueryRepositorySql.getById(blogId);
  //
  //   if (!findBlogById.id) {
  //     throw new BadRequestException('Sorry bro, blog not found');
  //   }
  //   const inputModelPost = {
  //     title: inputModel.title,
  //     shortDescription: inputModel.shortDescription,
  //     content: inputModel.content,
  //     blogId: blogId,
  //   };
  //
  //   const newPost = await this.postsService.createPost(
  //     inputModelPost,
  //     findBlogById.name,
  //   );
  //   return await this.postsQueryRepositorySql.getPostById(newPost);
  // }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') blogId: string) {
    const blogIsDeleted =
      await this.blogsQueryRepositorySql.getDeletedStatus(blogId);
    if (blogIsDeleted)
      throw new NotFoundException([
        { message: 'Blog not found', field: 'isDeleted' },
      ]);
    //return await this.blogsQueryRepository.getById(blogId);//mongoose
    return await this.blogsQueryRepositorySql.getById(blogId);
  }
  @Put(':blogId/posts/:postId')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() UpdateModel: PostForBlog,
  ) {
    const blogIsDeleted =
      await this.blogsQueryRepositorySql.getDeletedStatus(blogId);
    if (blogIsDeleted)
      throw new NotFoundException([
        { message: 'Blog not found', field: 'isDeleted' },
      ]);
    const postIsDeleted =
      await this.postsQueryRepositorySql.getDeletedStatus(postId);
    if (postIsDeleted)
      throw new NotFoundException([
        { message: 'Post not found', field: 'isDeleted' },
      ]);

    return await this.postsService.updatePostForBlog(
      blogId,
      postId,
      UpdateModel,
    );
  }
  // @Put(':id')
  // @UseGuards(AdminAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateBlog(
  //   @Param('id') blogId: string,
  //   @Body() UpdateModel: UpdateBlogInputModel,
  // ) {
  //   const blogIsDeleted =
  //     await this.blogsQueryRepositorySql.getDeletedStatus(blogId);
  //   if (blogIsDeleted)
  //     throw new NotFoundException([
  //       { message: 'Blog not found', field: 'isDeleted' },
  //     ]);
  //
  //   return await this.blogsService.updateBlog(blogId, UpdateModel);
  // }

  //   @Delete(':blogId/posts/:postId')
  //   @UseGuards(AdminAuthGuard)
  //   @HttpCode(HttpStatus.NO_CONTENT)
  //   async deletePostForBlog(
  //     @Param('blogId') blogId: string,
  //     @Param('postId') postId: string,
  //   ) {
  //     const postIsDeleted =
  //       await this.postsQueryRepositorySql.getDeletedStatus(postId);
  //     if (postIsDeleted)
  //       throw new NotFoundException([
  //         { message: 'Post not found', field: 'isDeleted' },
  //       ]);
  //
  //     return await this.postsService.deletePostForBlog(blogId, postId);
  //   }
  //
  //   @Delete(':id')
  //   @UseGuards(AdminAuthGuard)
  //   @HttpCode(HttpStatus.NO_CONTENT)
  //   async deleteBlog(@Param('id') blogId: string) {
  //     const blogIsDeleted =
  //       await this.blogsQueryRepositorySql.getDeletedStatus(blogId);
  //     if (blogIsDeleted)
  //       throw new NotFoundException([
  //         { message: 'Blog not found', field: 'isDeleted' },
  //       ]);
  //
  //     return await this.blogsService.deleteBlog(blogId);
  //   }
}
