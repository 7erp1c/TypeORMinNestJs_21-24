import { Blog } from '../domain/blogs.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UpdateBlogInputModel } from '../api/models/input/create.blog.input.model';

@Injectable()
export class BlogsRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(newBlogDto: Blog): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
          INSERT INTO "Blogs"
            ("name","description","websiteUrl","createdAt","isMembership")
              values($1,$2,$3,$4,$5)
              RETURNING id
    `,
        [
          newBlogDto.name,
          newBlogDto.description,
          newBlogDto.websiteUrl,
          newBlogDto.createdAt,
          newBlogDto.isMembership,
        ],
      );
      return result[0].id;
    } catch {
      throw new NotFoundException();
    }
  }

  async updateBlog(id: string, blogUpdateDto: UpdateBlogInputModel) {
    try {
      const isUpdated = await this.dataSource.query(
        `
      UPDATE public."Blogs"
      SET "name" = $2,"description"=$3,"websiteUrl"=$4
        WHERE "id" = $1
      `,
        [
          id,
          blogUpdateDto.name,
          blogUpdateDto.description,
          blogUpdateDto.websiteUrl,
        ],
      );
      if (isUpdated[1] === 0)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.updateBlog' },
        ]);
      return true;
    } catch {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.updateBlog' },
      ]);
    }
  }
  //
  async deleteBlog(id: string) {
    try {
      const deleteStatus = true;
      const isDelete = await this.dataSource.query(
        `
      UPDATE public."Blogs"
      SET "isDeleted" = $2
      WHERE id = $1`,
        [id, deleteStatus],
      );

      if (isDelete[1] === 0)
        throw new NotFoundException([
          { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
        ]);
      return true;
    } catch (error) {
      throw new NotFoundException([
        { message: 'Blog not found', field: 'BlogsRepository.deleteBlog' },
      ]);
    }
  }
}
