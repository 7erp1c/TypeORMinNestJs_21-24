import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { Model } from 'mongoose';
import { Post, postsDocument } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostOutputDto } from '../api/models/output/output.types';
import { postMapper } from '../api/models/output/post.output.models';
import { PostsLikesQueryRepository } from '../../likes/infrastructure/query/posts.likes.query.repository';
import { SortPostRepositoryType } from '../../../users/api/models/input/input';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsLikesQueryRepository: PostsLikesQueryRepository,
  ) {}

  async getAllPosts(
    sortData: SortPostRepositoryType,
    blogId?: string,
    userId?: string,
  ) {
    let searchKey = {};
    let sortKey = {};
    let sortDirection: number;
    //как искать
    if (blogId) searchKey = { blogId: blogId };

    // есть ли у searchNameTerm параметр создания ключа поиска
    const documentsTotalCount = await this.postModel.countDocuments(searchKey); // Receive total count of blogs
    const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Calculate total pages count according to page size
    const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize;

    //  имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
    if (sortData.sortDirection === 'desc') sortDirection = -1;
    else sortDirection = 1;

    // существуют ли поля, если нет, добавить createdAt
    if (sortData.sortBy === 'title') sortKey = { title: sortDirection };
    else if (sortData.sortBy === 'shortDescription')
      sortKey = { shortDescription: sortDirection };
    else if (sortData.sortBy === 'content')
      sortKey = { content: sortDirection };
    else if (sortData.sortBy === 'blogId') sortKey = { blogId: sortDirection };
    else if (sortData.sortBy === 'blogName')
      sortKey = { blogName: sortDirection };
    else sortKey = { createdAt: sortDirection };

    // Получать документы из DB
    const posts = await this.postModel
      .find(searchKey)
      .sort(sortKey)
      .skip(+skippedDocuments)
      .limit(+sortData.pageSize)
      .lean();

    const mappedPosts: PostOutputDto[] = [];

    for (let i = 0; i < posts.length; i++) {
      const likes = await this.postsLikesQueryRepository.getLikes(
        posts[i]._id.toString(),
        userId,
      );
      mappedPosts.push(postMapper(posts[i], likes));
    }

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: mappedPosts,
    };
  }

  // async getAllPosts(query: any) {
  //   const viewModel = new ViewModel();
  //   const posts = await this.postModel.find({}).lean();
  //
  //   viewModel.totalCount = await this.postModel.countDocuments({}); // Receive total count of blogs
  //   viewModel.pagesCount = Math.ceil(viewModel.totalCount / viewModel.pageSize); // Calculate total pages count according to page size
  //   viewModel.items = [...posts.map(postMapper)];
  //
  //   return viewModel;
  // }

  async getPostById(
    id: string,
    userId: string | null = null,
  ): Promise<PostOutputDto> {
    try {
      const post: postsDocument | null = await this.postModel.findById({
        _id: new Object(id),
      });
      if (!post) throw new NotFoundException('Post not found');
      const likes = await this.postsLikesQueryRepository.getLikes(id, userId!);
      return postMapper(post, likes);
    } catch {
      throw new NotFoundException('Catch getPostById');
    }
  }
}
