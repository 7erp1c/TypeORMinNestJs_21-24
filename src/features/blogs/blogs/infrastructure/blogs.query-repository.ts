import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blogs.entity';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogOutputModelMapper } from '../api/models/output/blog.output.model';
import { BlogTypeOutput } from '../api/models/output/output';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../../base/adapters/query/types';
@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}
  async getAllBlogs(sortData: QuerySortType, searchData: QuerySearchType) {
    //Определяются ключи для поиска и сортировки в зависимости от переданных данных.
    let searchKey = {};
    let sortKey = {};
    let sortDirection: number;

    // есть ли у searchNameTerm параметр создания ключа поиска
    if (searchData.searchNameTerm)
      searchKey = {
        name: { $regex: searchData.searchNameTerm, $options: 'i' },
      };

    // рассчитать лимиты для запроса к DB
    const documentsTotalCount = await this.blogModel.countDocuments(searchKey); // Получите общее количество блогов
    const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Рассчитайте общее количество страниц в соответствии с размером страницы
    const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize; // Подсчитать количество пропущенных документов перед запрошенной страницей

    // имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
    if (sortData.sortDirection === 'desc') sortDirection = -1;
    else sortDirection = 1;

    // существуют ли поля
    if (sortData.sortBy === 'description')
      sortKey = { description: sortDirection };
    else if (sortData.sortBy === 'websiteUrl')
      sortKey = { websiteUrl: sortDirection };
    else if (sortData.sortBy === 'name') sortKey = { name: sortDirection };
    else if (sortData.sortBy === 'isMembership')
      sortKey = { isMembership: sortDirection };
    else sortKey = { createdAt: sortDirection };

    // Получать документы из DB
    const blogs = await this.blogModel
      .find(searchKey)
      .sort(sortKey)
      .skip(+skippedDocuments)
      .limit(+sortData.pageSize)
      .lean();

    return {
      pagesCount: pageCount,
      page: +sortData.pageNumber,
      pageSize: +sortData.pageSize,
      totalCount: documentsTotalCount,
      items: blogs.map(BlogOutputModelMapper),
    };
  }
  async findBlogById(blogId: string): Promise<BlogTypeOutput> {
    try {
      const result = await this.blogModel.findById({ _id: blogId });
      if (!result) throw new NotFoundException('Blog not found');
      return BlogOutputModelMapper(result);
    } catch (error) {
      throw new NotFoundException('Blog not found');
    }
  }
}
