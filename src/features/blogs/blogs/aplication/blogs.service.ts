import {
  CreateBlogInputModel,
  UpdateBlogInputModel,
} from '../api/models/input/create.blog.input.model';
import { BlogTypeCreate } from '../api/models/input/input';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';
import { DateCreate } from '../../../../base/adapters/get-current-date';
import { BlogsRepositorySql } from '../infrastructure.sql/blogs.repository.sql';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly dateCreate: DateCreate,
    private readonly blogsRepositorySql: BlogsRepositorySql,
  ) {}
  async createBlog(inputModel: CreateBlogInputModel): Promise<string> {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();

    const newBlog: BlogTypeCreate = {
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      createdAt: createdAt,
      isMembership: false,
    };
    //return await this.blogsRepository.createBlog(newBlog); //mongoose
    return await this.blogsRepositorySql.createBlog(newBlog);
  }

  async updateBlog(blogId: string, blogUpdateDto: UpdateBlogInputModel) {
    //return await this.blogsRepository.updateBlog(blogId, blogUpdateDto); mongoose
    return await this.blogsRepositorySql.updateBlog(blogId, blogUpdateDto);
  }

  async deleteBlog(blogId: string) {
    // return await this.blogsRepository.deleteBlog(blogId);//mongoose
    return await this.blogsRepositorySql.deleteBlog(blogId);
  }

  async findBlogById(blogId: string) {
    return await this.blogsRepository.findBlogById(blogId);
  }
}
