import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blogs.entity';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogTypeOutput } from '../api/models/output/output';
import { ObjectId } from 'mongodb';
import { UpdateBlogInputModel } from '../api/models/input/create.blog.input.model';
@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async createBlog(newBlogDto: Blog): Promise<BlogTypeOutput> {
    const createBlog = await this.blogModel.create(newBlogDto);
    return {
      id: createBlog._id.toString(),
      name: createBlog.name,
      description: createBlog.description,
      websiteUrl: createBlog.websiteUrl,
      createdAt: createBlog.createdAt,
      isMembership: createBlog.isMembership,
    };
  }

  async updateBlog(id: string, blogUpdateDto: UpdateBlogInputModel) {
    try {
      const result = await this.blogModel.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: blogUpdateDto,
        },
      );
      if (!result)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.updateBlog' },
        ]);
    } catch {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.updateBlog' },
      ]);
    }
  }

  async deleteBlog(id: string) {
    try {
      const result = await this.blogModel
        .findOneAndDelete({
          _id: new ObjectId(id),
        })
        .exec();
      if (!result)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
        ]);
      return result;
    } catch (error) {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
      ]);
    }
  }

  async findBlogById(id: string) {
    try {
      const result = await this.blogModel.findById({ _id: new ObjectId(id) });
      if (!result)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.findBlogById' },
        ]);
      return result;
    } catch (error) {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.findBlogById' },
      ]);
    }
  }
}
