import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CommentsLikesInputModel,
  PostsLikesInputModel,
} from '../../likes/api/model/input/likes.input.models';
import { Request } from 'express';
import { CommentsService } from '../aplication/comments.service';
import { LikesCommentsService } from '../../likes/aplication/likes.comments.service';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import { CommentUpdateInputModel } from './input/comments.input.model';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { BlindGuard } from '../../../../common/guards/blind.guard.token';
import { CommentsQueryRepositorySql } from '../infrastructure.sql/comments.query.repository.sql';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected likesCommentsService: LikesCommentsService,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsQueryRepositorySql: CommentsQueryRepositorySql,
  ) {}
  @Put('/:commentId/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOrCreateCommentLike(
    @Param('commentId') id: string,
    @Body() inputModel: CommentsLikesInputModel,
    @Req() req: Request,
  ) {
    // console.log('commentId', id);
    // const comment = await this.commentsService.getCommentById(id);
    // if (!comment) throw new NotFoundException('Comment Not Found');//mongoose
    const commentIsDeleted =
      await this.commentsQueryRepositorySql.getDeletedStatus(id);
    if (commentIsDeleted)
      throw new NotFoundException([
        { message: 'Comment not found', field: 'isDeleted' },
      ]);
    await this.likesCommentsService.updateOrCreateCommentLike(
      id,
      inputModel,
      req.user.userId,
    );
  }

  @Put('/:commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async UpdateComment(
    @Param('commentId') id: string,
    @Body() inputModel: CommentUpdateInputModel,
    @Req() req: Request,
  ) {
    const commentIsDeleted =
      await this.commentsQueryRepositorySql.getDeletedStatus(id);
    if (commentIsDeleted)
      throw new NotFoundException([
        { message: 'Comment not found', field: 'isDeleted' },
      ]);
    return await this.commentsService.updateComment(
      req.params.commentId,
      inputModel,
      req.user.userId,
    );
    //403
  }

  @Delete('/:commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommentById(@Param('commentId') id: string, @Req() req: Request) {
    // const findCommentById = await this.commentsService.getCommentById(id);
    // if (!findCommentById) throw new BadRequestException('Comment nor found');//mongoose
    const commentIsDeleted =
      await this.commentsQueryRepositorySql.getDeletedStatus(id);
    if (commentIsDeleted)
      throw new NotFoundException([
        { message: 'Comment not found', field: 'isDeleted' },
      ]);
    return await this.commentsService.deleteComment(id, req.user.userId);
    //403
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async commentById(@Param('id') id: string, @Req() req: Request) {
    // const findCommentById = await this.commentsService.getCommentById(id);
    // if (!findCommentById) throw new BadRequestException('Comment nor found');//mongoose
    const commentIsDeleted =
      await this.commentsQueryRepositorySql.getDeletedStatus(id);
    if (commentIsDeleted)
      throw new NotFoundException([
        { message: 'Comment not found', field: 'isDeleted' },
      ]);
    if (req.user && req.user.userId) {
      //return await this.commentsQueryRepository.getCommentById(//mongoose
      return await this.commentsQueryRepositorySql.getCommentById(
        id,
        req.user.userId!,
      );
    } else {
      //return await this.commentsQueryRepositorySql.getCommentById(id, undefined);//mongoose
      return await this.commentsQueryRepositorySql.getCommentById(
        id,
        undefined,
      );
    }
  }
}
