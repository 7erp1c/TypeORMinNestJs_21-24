import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CommentCreateInputModel,
  CreatePostInputModels,
  UpdatePostInputModel,
} from './models/input/create.post.input.models';
import { BlogsService } from '../../blogs/aplication/blogs.service';
import { PostsService } from '../aplication/posts.service';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { CommentCreateDto } from '../../blogs/api/models/input/input';
import { PostOutputDto } from './models/output/output.types';
import { QueryPostsRequestType } from './models/input/input';
import { Request } from 'express';
import { CommentsService } from '../../comments/aplication/comments.service';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query.repository';
import { PostsLikesInputModel } from '../../likes/api/model/input/likes.input.models';
import { LikesPostService } from '../../likes/aplication/likes.post.service';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { BlindGuard } from '../../../../common/guards/blind.guard.token';
import { createQuery } from '../../../../base/adapters/query/create.query';
import { AdminAuthGuard } from '../../../../common/guards/auth.admin.guard';
import { QueryUsersRequestType } from '../../../users/api/models/input/input';
import { PostsQueryRepositorySql } from '../infrastructure.sql/posts.query.repository.sql';
import { CommentsQueryRepositorySql } from '../../comments/infrastructure.sql/comments.query.repository.sql';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsService: CommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesService: LikesPostService,
    protected postsQueryRepositorySql: PostsQueryRepositorySql,
    protected commentsQueryRepositorySql: CommentsQueryRepositorySql,
  ) {}

  @Put('/:id/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateAndCreateLikeStatus(
    @Param('id') id: string,
    @Body() inputModel: PostsLikesInputModel,
    @Req() req: Request,
  ) {
    // const findPost = await this.postsService.findPostById(id);
    // if (!findPost) throw new BadRequestException('Post not in Db'); mongoose
    const postIsDeleted =
      await this.postsQueryRepositorySql.getDeletedStatus(id);
    if (postIsDeleted)
      throw new NotFoundException([
        { message: 'Post not found', field: 'isDeleted' },
      ]);
    return await this.likesService.createLikePost(
      req.user.userId,
      req.user.loginUser,
      id,
      inputModel,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async getAllPosts(
    @Query() query: QueryPostsRequestType,
    @Req() req: Request,
  ) {
    const { sortData } = createQuery(query);
    if (req.user && req.user.userId) {
      // return await this.postsQueryRepository.getAllPosts(//mongoose
      return await this.postsQueryRepositorySql.getAllPosts(
        sortData,
        undefined,
        req.user.userId,
      );
    } else {
      //return await this.postsQueryRepository.getAllPosts(sortData);//mongoose
      return await this.postsQueryRepositorySql.getAllPosts(sortData);
    }
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() inputModel: CreatePostInputModels) {
    const findBlogById = await this.blogsService.findBlogById(
      inputModel.blogId,
    );
    if (!findBlogById) {
      throw new NotFoundException([
        { message: 'Sorry bro, blog not found', field: 'blogId' },
      ]);
    }
    const newPosts = await this.postsService.createPost(
      inputModel,
      findBlogById.name,
    );
    return await this.postsQueryRepository.getPostById(newPosts);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async getPostById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<PostOutputDto> {
    const postIsDeleted =
      await this.postsQueryRepositorySql.getDeletedStatus(id);
    if (postIsDeleted)
      throw new NotFoundException([
        { message: 'Post not found', field: 'isDeleted' },
      ]);
    // Проверяем, существует ли объект req.user и его свойство userId
    if (req.user && req.user.userId) {
      console.log('user', req.user.userId);
      //return await this.postsQueryRepository.getPostById(id, req.user.userId); // mongoose
      return await this.postsQueryRepositorySql.getPostById(
        id,
        req.user.userId,
      );
    } else {
      // Если req.user не существует или не имеет свойства userId, передаём null
      // return await this.postsQueryRepository.getPostById(id, null); // mongoose
      return await this.postsQueryRepositorySql.getPostById(id, null);
    }
  }

  @Put('/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() UpdateModel: UpdatePostInputModel,
  ) {
    return await this.postsService.updateBlog(postId, UpdateModel);
  }

  @Delete('/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    return await this.postsService.deletePost(postId);
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async getAllCommentsForPost(
    @Param('id') id: string,
    @Query() query: QueryUsersRequestType,
    @Req() req: Request,
  ) {
    const { sortData } = createQuery(query);
    // const findPostById = await this.postsService.findPostById(id);
    // if (!findPostById) throw new BadRequestException('Post not found');//mongoose
    const postIsDeleted =
      await this.postsQueryRepositorySql.getDeletedStatus(id);
    if (postIsDeleted)
      throw new NotFoundException([
        { message: 'Post not found', field: 'isDeleted' },
      ]);
    if (req.user && req.user.userId) {
      return await this.commentsQueryRepositorySql.getAllCommentsForPost(
        sortData,
        id,
        req.user.userId,
      );
    }

    return await this.commentsQueryRepositorySql.getAllCommentsForPost(
      sortData,
      id,
      undefined,
    );
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  async createNewCommentToPost(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() inputModel: CommentCreateInputModel,
  ) {
    console.log(id);
    //const findPost = await this.postsService.findPostById(id);//mongoose
    //if (!findPost) throw new NotFoundException('post not found');
    const postIsDeleted =
      await this.postsQueryRepositorySql.getDeletedStatus(id);
    if (postIsDeleted)
      throw new NotFoundException([
        { message: 'Post not found', field: 'isDeleted' },
      ]);
    console.log('postIsDeleted: ', postIsDeleted);
    const commentCreateDto: CommentCreateDto = {
      content: inputModel.content,
      postId: id,
      userId: req.user.userId,
    };
    const commentId: string =
      await this.commentsService.createComment(commentCreateDto);
    //return await this.commentsQueryRepository.getCommentById(commentId);//mongoose
    return await this.commentsQueryRepositorySql.getCommentById(commentId);
  }
}
