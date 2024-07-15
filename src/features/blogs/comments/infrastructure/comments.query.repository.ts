import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LikesInfoType } from '../../likes/api/model/output/output';
import { ObjectId } from 'mongodb';
import { CommentsLikesQueryRepository } from '../../likes/infrastructure/query/comments.likes.query.repository';
import { getCommentsView } from '../api/output/mapper';
import { CommentView, CommentViewOutput } from '../api/output/type';
import {
  CommentsViewModelType,
  SortCommentsRepositoryType,
} from '../api/output/promise.query';
import { CommentsDb } from '../domain/comments.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentsDb.name)
    private readonly commentModel: Model<CommentsDb>,
    protected commentsLikesQueryRepository: CommentsLikesQueryRepository,
  ) {}

  async getAllCommentsForPost(
    sortData: SortCommentsRepositoryType,
    postId?: string,
    userId?: string,
  ): Promise<CommentsViewModelType> {
    let searchKey = {};
    let sortKey = {};
    let sortDirection: number;
    //как искать
    if (postId) searchKey = { postId: postId };

    // есть ли у searchNameTerm параметр создания ключа поиска
    const documentsTotalCount =
      await this.commentModel.countDocuments(searchKey); // Receive total count of comments
    const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Calculate total pages count according to page size
    const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize;

    //  имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
    if (sortData.sortDirection === 'desc') sortDirection = -1;
    else sortDirection = 1;

    // существуют ли поля, если нет, добавить createdAt
    if (sortData.sortBy === 'content') sortKey = { content: sortDirection };
    else if (sortData.sortBy === 'commentatorInfo')
      sortKey = { commentatorInfo: sortDirection };
    else if (sortData.sortBy === 'commentatorInfo.userId')
      sortKey = { userId: sortDirection };
    else if (sortData.sortBy === 'commentatorInfo.userLogin')
      sortKey = { userLogin: sortDirection };
    else sortKey = { createdAt: sortDirection };

    // Получаем comments из DB
    const comments = await this.commentModel
      .find(searchKey)
      .sort(sortKey)
      .skip(+skippedDocuments)
      .limit(+sortData.pageSize)
      .lean();

    const mappedComments: CommentViewOutput[] = [];

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i] as unknown as CommentView;
      const likes: LikesInfoType =
        await this.commentsLikesQueryRepository.getLikes(
          comments[i]._id.toString(),
          userId,
        );
      mappedComments.push(getCommentsView(comment, likes));
    }

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: mappedComments,
    };
  }
  // return one post by id
  // async getPostById(id: string): Promise<PostsType | null> {
  //   try {
  //     const post: PostsType | null = await PostModel.findOne({id},{ projection: { _id: 0 }});
  //     if (!post) {
  //       return null;
  //     }
  //     return getPostsView(post);
  //   } catch (err) {
  //     return null;
  //   }
  // }
  async getCommentById(commentId: string, userId?: string) {
    try {
      const comment = await this.commentModel.findOne({
        _id: new ObjectId(commentId),
      });
      const likes: LikesInfoType =
        await this.commentsLikesQueryRepository.getLikes(commentId, userId);
      const comments = comment as unknown as CommentView;
      if (comment) return getCommentsView(comments, likes);
      else return null;
    } catch (err) {
      return null;
    }
  }
}
